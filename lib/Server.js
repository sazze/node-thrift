var _ = require('lodash');
var Server = require('./_thriftServer');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var AURA_DEFINED = !_.isUndefined(global.aura);
var AURA_CONFIG_EXISTS = AURA_DEFINED && _.isPlainObject(aura.config) && _.isPlainObject(aura.config.thrift) && _.isPlainObject(aura.config.thrift.server);

var log = (!AURA_DEFINED || _.isUndefined(global.aura.log) ? {
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: _.noop,
  verbose: _.noop
} : global.aura.log);

var defaultOptions = {
  host: (AURA_CONFIG_EXISTS && aura.config.thrift.server.host ? aura.config.thrift.server.host : '0.0.0.0'),
  port: (AURA_CONFIG_EXISTS && aura.config.thrift.server.port ? aura.config.thrift.server.port : 0)
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

    if (AURA_CONFIG_EXISTS && !aura.config.thrift.server.port && address) {
      aura.config.thrift.server.port = address.port;
    }

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