var _ = require('lodash');
var thrift = require('thrift');

var server = require('./lib/Server');
var client = require('./lib/Client');

module.exports = _.merge({}, server, client);