var thrift = require('thrift');
var _ = require('lodash');

var log = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: _.noop,
  verbose: _.noop
};

/**
 * Create a new thrift client
 *
 * @param {string} host
 * @param {int} port
 * @param {Object} service
 * @param {Transport} transport
 *
 * @throws {Error} error If thrift service does not have a Client property
 *
 * @constructor
 */
function Client(host, port, service, transport) {
  if (!service.hasOwnProperty('Client')) {
    throw new Error('Thrift Service must have a Client');
  }

  /**
   * The host of the thrift server
   *
   * @type {string}
   */
  this.host = host;

  /**
   * The port of the thrift server
   *
   * @type {Number}
   */
  this.port = port;

  /**
   * Whether or not to autoClose connection
   *
   * @type {boolean}
   */
  this.autoClose = true;

  /**
   * The thrift service
   *
   * @type {Object}
   */
  this.service = service;

  /**
   * The thrift transport
   *
   * @type {*|TBufferedTransport}
   */
  this.transport = transport || thrift.TBufferedTransport;

  /**
   * The Thrift Service Client
   * @type {Client}
   */
  this.client = new service.Client;

  /**
   * The Thrift Client Connection
   *
   * @type {*}
   * @private
   */
  this._connection = null;

  /**
   * The Thrift Client
   *
   * @type {null}
   * @private
   */
  this._client = null;

  /**
   * Whether or not we are connected to thrift
   *
   * @type {boolean}
   */
  this.isConnected = false;

  /**
   * A Success Pre-parser Callback
   * @param {*} data
   * @param {Function} Success Callback
   * @param {Function} Error Callback
   * @type {Function|null}
   */
  this.successCallback = null;

  /**
   * A Error Pre-parser Callback
   * @param {*} data
   * @param {Function} Error Callback
   * @type {Function|null}
   */
  this.errorCallback = null;
}

/**
 * Create a thrift client connection
 *
 * @private
 */
Client.prototype._createConnection = function _createConnection(cb) {
  var connection = thrift.createConnection(
    this.host, this.port,
    {
      transport: this.transport,
      protocol: thrift.TBinaryProtocol
    }
  );

  log.verbose('Thrift: Connecting...');

  connection.on('error', function(err) {
    log.verbose('Thrift Error: ' + err);

    if (err.code == 'ECONNRESET') {
      // Reestablish Connection
      this._createConnection();
    } else {
      cb.apply(this);
    }
  }.bind(this));

  connection.on('connect', function(e) {
    "use strict";
    log.verbose('Thrift: Connected');

    this.isConnected = true;
    cb.apply(this);
  }.bind(this));

  connection.on('close', function(e) {
    "use strict";
    log.verbose('Thrift: Connection Closed');

    this.isConnected = false;
  }.bind(this));

  this._connection = connection;
};

/**
 * Create a Thrift Client
 *
 * @param cb
 * @private
 */
Client.prototype._createClient = function _createClient(cb) {
  "use strict";

  if (this.isConnected) {
    this._client = thrift.createClient(this.service, this._connection);
    cb.apply(this);
    return;
  }

  this._createConnection(function(err) {
    if (err) {
      log.error(err);

      return;
    }

    this._client = thrift.createClient(this.service, this._connection);
    cb.apply(this);
  }.bind(this));
};

/**
 * Call a thrift function
 *
 * @param {string|function} functionName if it is a string then it will lookup function or you can pass a function reference to call
 * @param {Array} [args] the arguments to pass to the thrift call
 * @param {function} successCallback the success callback
 * @param {function} errorCallback the error callback
 */
Client.prototype.call = function callThrift(functionName, args, successCallback, errorCallback) {
  if (_.isFunction(args)) {
    errorCallback = successCallback;
    successCallback = args;
    args = [];
  }

  /**
   * Actually makes the thrift call
   * @private
   */
  var makeCall = function() {
    log.verbose('Thrift: Making Call');

    args.push(function(err, data) {
      log.verbose('Thrift: Call Completed');

      if (this.autoClose) {
        this.close();
      }

      if(err) {
        this._error(err, errorCallback);
        return;
      }

      this._success(data, successCallback, errorCallback);
    }.bind(this));

    var clientFunction = null;

    // Check if functionName is a function
    if (typeof functionName === 'function') {
      clientFunction = functionName;

      // Check if functionName is a string
    } else if (typeof functionName === 'string') {

      // Make sure function exists
      if (typeof this._client[functionName] !== 'function') {
        this._error('Thrift Function does not exist', errorCallback);

        return;
      }

      clientFunction = this._client[functionName];
    } else {
      // Unsupported function type
      this._error('Thrift Function not supported', errorCallback);

      return;
    }

    // Make sure function exists
    if (typeof clientFunction !== 'function') {
      this._error('Thrift Function does not exist', errorCallback);
    }

    // Call function
    log.verbose('Thrift: Calling Function');

    clientFunction.apply(this._client, args);
  }.bind(this);

  // Make The Call Depending on status
  if (!this._client || !this.isConnected) {
    // Set the call on to the next tick
    setTimeout(function() {
      this._createClient(makeCall);
    }.bind(this), 0);
  } else if (this.isConnected) {
    makeCall.apply(this);
  }
};

/**
 * Call the correct success function if there is one
 *
 * @param data
 * @param successCallback
 */
Client.prototype._success = function callSuccess(data, successCallback, errorCallback) {
  "use strict";

  if (_.isFunction(successCallback)) {
    if (_.isFunction(this.successCallback)) {
      log.verbose('Thrift: Calling success pre-parser');

      this.successCallback(data, successCallback, errorCallback);
    } else {
      log.verbose('Thrift: Calling success function');

      successCallback(data);
    }
  }
};

/**
 * Call the correct error function if there is one
 *
 * @param err
 * @param errorCallback
 */
Client.prototype._error = function callSuccess(err, errorCallback) {
  "use strict";

  if (_.isFunction(errorCallback)) {
    if (_.isFunction(this.errorCallback)) {
      this.errorCallback(err, errorCallback);
    } else {
      errorCallback(err);
    }
  }
};

/**
 * Close the connection, Only need to do this when
 * `autoClose` is false
 */
Client.prototype.close = function closeConnection() {
  "use strict";
  if (this.isConnected) {
    this.isConnected = false;
    this._connection.end();
  }
};

module.exports = Client;