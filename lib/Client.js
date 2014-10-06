var Client = require('./_thriftClient');

/**
 * Create a new Thrift Client
 *
 * @param {string} host the thrift host
 * @param {int} port the thrift port
 * @param {Object} service
 * @param {Transport} transport
 *
 * @returns {Client}
 */
module.exports.createClient = function(host, port, service, transport) {
  return new Client(host, port, service, transport);
};

function ThriftClient(host, port, service) {
  this._client = module.exports.createClient(host, port, service);
}

ThriftClient.prototype.send = function (func, args, success, error) {
  this._client.call(func, args, success, error);
};

module.exports.ThriftClient = ThriftClient;