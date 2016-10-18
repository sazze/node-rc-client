/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var ioClient = require('engine.io-client');
var protocol = require('@sazze/rc-protocol');
var url = require('url');
var _ = require('lodash');
var debug = require('debug')('@sazze/rc-client');
var path = require('path');

var Message = protocol.Message;
var Response = protocol.Response;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function Client(options) {
  if (!_.isPlainObject(options)) {
    options = {};
  }

  this.engineOptions = {
    rejectUnauthorized: false,
    rememberUpgrade: true,
    transports: ['websocket'],
    extraHeaders: {
      authorization: ''
    }
  };

  this.options = {
    host: process.env.SZ_RC_CLIENT_HOST || null,
    port: process.env.SZ_RC_CLIENT_PORT || 4515,
    keyDir: process.env.SZ_RC_CLIENT_KEY_DIR || '',
    keyName: process.env.SZ_RC_CLIENT_KEY_NAME || '',
    retry: 0
  };

  _.merge(this.options, options);

  this.url = {
    protocol: 'wss',
    slashes: true,
    hostname: this.options.host,
    port: this.options.port
  };

  this._retries = 0;
}

module.exports = Client;

Client.prototype.send = function (command, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  if (!_.isPlainObject(options)) {
    options = {};
  }

  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  var response = null;
  var error = null;

  protocol.Auth.createSig(this.options.keyName, this.options.keyDir, function (err, authHeader) {
    if (err) {
      callback(err, response);
      return;
    }

    this.engineOptions.extraHeaders.authorization = authHeader;

    debug(this.url);
    debug(this.engineOptions);

    var connected = false;
    var socket = ioClient(url.format(this.url), this.engineOptions);

    socket.on('open', function () {
      connected = true;

      var message = new Message();

      message.command = command;
      message.options = options;

      socket.send(JSON.stringify(message));
    });

    socket.on('message', function (data) {
      if (_.isString(data)) {
        data = JSON.parse(data);
      }

      response = new Response(data);

      socket.close();
    });

    socket.on('error', function (err) {
      error = err;
    });

    socket.on('close', function () {
      if (!connected && this.options.retry > 0 && this.options.retry > this._retries++) {
        debug('connection failed.  retrying (' + this._retries + ' / ' + this.options.retry + ')');
        this.send(command, options, callback);
        return;
      }

      this._retries = 0;

      callback(error, response);
    }.bind(this));
  }.bind(this));
};