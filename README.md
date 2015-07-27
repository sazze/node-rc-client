## rc-client

Client library for sending remote commands to hosts running the remote-control service.

Can be integrated into other applications or run from the command line.

### Command Line

```
npm install -g sz-rc-client
rc --help
```

### Application Integration
```
npm install --save sz-rc-client
```

```js
var Client = require('sz-rc-client');

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