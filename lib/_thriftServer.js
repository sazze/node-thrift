var thrift = require('thrift');


/**
 * Create a New thrift Server
 *
 * @param {object} service the thrift service
 * @param {object} methods the function handlers for the thrift calls
 *
 * @fires thrift/Server#listening
 * @fires thrift/Server#connection
 * @fires thrift/Server#close
 * @fires thrift/Server#error
 *
 * @class thrift/Server
 */
function Server(service, methods) {
  this.service = service;
  this.methods = methods;

  if (typeof service === 'undefined') {
    throw new Error('Thrift Service is required');
  }

  if (typeof methods !== 'object' || Object.keys(methods).length === 0) {
    throw new Error('Thrift Methods Handlers are required');
  }

  return thrift.createServer(this.service, this.methods,
    {transport: thrift.TBufferedTransport, protocol: thrift.TBinaryProtocol});
}

// Expose Server
module.exports = Server;

/**
 * Emitted when the server has been bound after calling `server.listen`.
 *
 * @event thrift/Server#listening
 */

/**
 * Emitted when a new connection is made. `socket` is an instance of `net.Socket`.
 *
 * @event thrift/Server#connection
 * @property {Socket} socket The connection object
 */

/**
 * Emitted when the server closes. Note that if connections exist, this event is not emitted until all connections are ended.
 *
 * @event thrift/Server#close
 */

/**
 * Emitted when an error occurs. The `'close'` event will be called directly following this event.
 *
 * @event thrift/Server#error
 * @property {Error} error The Error Object
 */