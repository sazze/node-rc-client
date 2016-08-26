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

```js
var Client = require('@sazze/rc-client');

var options = {
  host: '127.0.0.1',
  keyDir: process.env.HOME,
  keyName: 'foo'
};

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
