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
var Duplex = require('stream').Duplex;
var util = require('util');

var Message = protocol.Message;
var Response = protocol.Response;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function Client(options) {
  Duplex.call(this, {readableObjectMode: true, writableObjectMode: true});

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

  this.connected = false;
  this.socket = null;
}

Client.protocol = protocol;

util.inherits(Client, Duplex);

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

  this.on('data', function (msg) {
    response = new Response(msg);

    this.socket.close();
  }.bind(this));

  this.on('error', function (err) {
    error = err;
  });

  this.on('close', function () {
    callback(error, response);
  });

  var message = new Message();

  message.command = command;
  message.options = options;

  this.write(message);
};

Client.prototype.createSig = function (callback) {
  protocol.Auth.createSig(this.options.keyName, this.options.keyDir, function (err, authHeader) {
    if (err) {
      callback(err);
      return;
    }

    this.engineOptions.extraHeaders.authorization = authHeader;

    debug(this.engineOptions);

    callback();
  }.bind(this));
};

Client.prototype.connect = function (callback) {
  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  this.createSig(function (err) {
    if (err) {
      callback(err);
      return;
    }

    debug(this.url);

    this.socket = ioClient(url.format(this.url), this.engineOptions);

    this.socket.on('open', function () {
      this.connected = true;
      this.emit('connect');
      callback();
    }.bind(this));

    this.socket.on('error', function (err) {
      debug('error: ' + (err.stack || err.message || err));
      this.emit('error', err);
    }.bind(this));

    this.socket.on('close', function () {
      if (!this.connected && this.options.retry > 0 && this.options.retry > this._retries++) {
        debug('connection failed.  retrying (' + this._retries + ' / ' + this.options.retry + ')');
        this.emit('retry', this._retries, this.options.retry);
        return this.connect();
      }

      this._retries = 0;

      if (this._readableState !== null) {
        // end the read stream
        this.push(null);
      }

      this.emit('close');
    }.bind(this));

    this.socket.on('message', function (data) {
      debug('message received: ' + data);

      if (_.isString(data)) {
        data = JSON.parse(data);
      }

      this.push(data);
    }.bind(this));
  }.bind(this));
};

Client.prototype.disconnect = function () {
  if (this.socket) {
    this.socket.close();
  }
};

Client.prototype._write = function (message, encoding, done) {
  debug('sending message');

  if (this.socket && this.connected) {
    this.socket.send(JSON.stringify(message));
    done();
    return;
  }

  debug('connecting before sending message');

  this.connect(function (err) {
    if (err) {
      done(err);
      return;
    }

    this.socket.send(JSON.stringify(message));

    done();
  }.bind(this));
};

Client.prototype._read = _.noop;