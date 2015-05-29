var Client = require('./_thriftHttpClient');

/**
 * Create a new Thrift HTTP Client
 *
 * @param {string} host the thrift host
 * @param {int} port the thrift port
 * @param {string} path the thrift path
 * @param {Object} service
 * @param {Transport} transport
 *
 * @returns {Client}
 */
module.exports.createHttpClient = function(host, port, path, service, transport) {
  return new Client(host, port, path, service, transport);
};

function ThriftHttpClient(host, port, path, service) {
  this._client = module.exports.createHttpClient(host, port, path, service);
}

ThriftHttpClient.prototype.send = function (func, args, success, error) {
  this._client.call(func, args, success, error);
};

module.exports.ThriftHttpClient = ThriftHttpClient;