## rc-client

Official client (and client library) for sending remote commands to hosts running the [remote-control](https://github.com/sazze/node-remote-control) service.

Can be integrated into other applications or run from the command line.

### Command Line

```
npm install -g @sazze/rc-client
rc --help
```

To run the same command on multiple hosts, pipe the hosts to `rc`.

```bash
cat hosts.txt | rc -c config.json "uname -a"
```

**Configuration File:**

Specify a configuration file to use by passing the `-c` option.

The configuration file is a properly formatted JSON file (example below):

```javascript
{
  "host": "127.0.0.1",
  "port": 4515,
  "keyDir": "/path/to/key/dir",
  "keyName": "foo"
}
```

### Application Integration
```
npm install --save @sazze/rc-client
```

**Create a new instance of the client library to work with:**

```js
var Client = require('@sazze/rc-client');

var options = {
  host: '127.0.0.1',
  keyDir: process.env.HOME,
  keyName: 'foo'
};

var client = new Client(options);
```

**Recommended Integration:** (introduced in version 1.3.0)

The client library implements a Duplex stream interface (in ObjectMode) that allows messages to be sent by calling `write()` and received by registering a listener to the `data` event.

```js
var client = new Client(options);

client.on('data', function (msg) {
    // format the message with a specific rc protocol message type
    msg = new Client.protocol.Response(msg);
    
    console.log(msg);
    
    // end the session
    client.disconnect();
});

var msg = new Client.protocol.Message();

msg.command = 'echo "Hello World!"'

client.write(msg);
```

Piping to and from an instance of the client library is also supported.

```js
var client = new Client(options);
// stream that emits rc protocol message objects
var msgStream = new MsgReadableStream();

msgStream.pipe(client).pipe(process.stdout);
```

All Duplex stream interactions are supported.

**Deprecated Integration:**

```js
var client = new Client(options);

client.send('echo "Hello World!"', function (err, result) {
  if (err) {
    console.error(err.stack || err.message || err);
  }

  if (result) {
    console.log(result);
  }
});
```

### Environment Variables

* `SZ_RC_CLIENT_HOST`
* `SZ_RC_CLIENT_PORT`
* `SZ_RC_CLIENT_KEY_DIR`
* `SZ_RC_CLIENT_KEY_NAME`

### License

ISC License (ISC)

Copyright (c) 2016, Sazze, Inc.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
