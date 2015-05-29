### sz-thrift

---

Helper library for the `thrift` nodejs module.

#### Exampes

---

These examples expect that your generated thrift code is available in a nodejs module named `<thrift_service_module>`

**Socket Client:**

```js
var thrift = require('sz-thrift');
var thriftService = require('<thrift_service_module>').Service;

var service = new thriftService.Client();

var options = {
  host: 'localhost',
  port: 9090,
};

var client = thrift.Client(options);

client.call(service.action, [], function (data) {
  //success
}, function (err) {
  // error
});
```

**HTTP Client:**

```js
var thrift = require('sz-thrift');
var thriftService = require('<thrift_service_module>').Service;

var service = new thriftService.Client();

var options = {
  type: 'http',
  host: 'localhost',
  port: 9090,
  path: '/foo'
};

var client = thrift.Client(options);

clilent.call(service.action, [], function (data) {
  //success
}, function (err) {
  // error
});
```

#### Options

---

- `type`: [optional] 'http' or 'socket' (default: 'socket')
- `host`: hostname or ip address of the server
- `port`: port the server is listening on
- `path`: the path where the server is listening (required when `type` = 'http')
- `service`: the thrift service object (from thrift generated code)
- `transport`: [optional] the thrift transport to use (default: `thrift.TBufferedTransport` from the `thrift` module)
- `protocol`: [optional] the thrift protocol to use (default: `thrift.TBinaryProtocol` from the `thrift` module)