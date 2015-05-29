var _ = require('lodash');
var thrift = require('thrift');

var server = require('./lib/Server');
var client = require('./lib/Client');
var httpClient = require('./lib/HttpClient');

var CLIENT_TYPE = {
  HTTP: 'http',
  SOCKET: 'socket'
};

var DEFAULT_CLIENT_OPTIONS = {
  type: CLIENT_TYPE.SOCKET,
  transport: thrift.TBufferedTransport,
  protocol: thrift.TBinaryProtocol
};

module.exports = _.merge({}, server, client, httpClient);

module.exports.Client = function (options) {
  if (!_.isPlainObject(options)) {
    options = {};
  }

  var opts = _.merge({}, DEFAULT_CLIENT_OPTIONS, options);

  switch (opts.type) {
    case CLIENT_TYPE.HTTP:
      return module.exports.createHttpClient(opts.host, opts.port, opts.path, opts.service, opts.transport, opts.protocol);
      break;

    case CLIENT_TYPE.SOCKET:
      return module.exports.createClient(opts.host, opts.port, opts.service, opts.transport, opts.protocol);
      break;

    default:
      throw(new Error('Invalid client type'));
      return;
  }
};