var _ = require('lodash');
var Server = require('./_thriftServer');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var log = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: _.noop,
  verbose: _.noop
};

var defaultOptions = {
  host: '0.0.0.0',
  port: 0
};

module.exports.createServer = function(service, methods) {
  return new Server(service, methods);
};

function ThriftServer(service, methods, options) {
  EventEmitter.call(this);

  if (!_.isPlainObject(options)) {
    options = {};
  }

  this.options = _.defaults(options, defaultOptions);

  this._server = module.exports.createServer(service, methods);

  this._server.on('close', function() {
    log.verbose('Thrift Serving Shutdown');
  });
}

util.inherits(ThriftServer, EventEmitter);

module.exports.ThriftServer = ThriftServer;

ThriftServer.prototype.start = function(port, host, cb) {
  var self = this;

  if (_.isFunction(port)) {
    cb = port;
    port = this.options.port;
    host = this.options.host;
  }

  if (_.isFunction(host)) {
    cb = host;
    host = this.options.host;
  }

  if (!_.isFunction(cb)) {
    cb = _.noop;
  }

  if (!port || port < 0) {
    port = this.options.port;
  }

  if (!host) {
    host = this.options.host;
  }

  this.once('listening', cb);

  this._server.once('listening', function() {
    var address = self._server.address();

    if (address) {
      log.info('Thrift Server Listening on port %d', address.port);
    }

    self.emit('listening', address);
  });

  this._server.listen(port, host);

  this.emit('start');
};

ThriftServer.prototype.stop = function(cb) {
  if (_.isFunction(cb)) {
    this.once('stop', cb);
  }

  this._server.close(function () {
    this.emit('stop');
  }.bind(this));
};