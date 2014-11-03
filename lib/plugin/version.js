'use strict';

/*!
 * Module dependencies.
 */

var qs = require('qs')

/**
 * Set a querystring version of `keys` to the request headers for restify routing
 *
 * Must be used as `pre` middleware
 *
 * @param {Array} query string names
 * @param {String} header name for version (optional, default `x-api-version`)
 * @return {Function} restify middleware
 */

module.exports = function(keys, header) {
	header = header || 'x-api-version'
	if (!Array.isArray(keys)) {
		keys = [keys]
	}
	return function(req, res, next) {
		var query = qs.parse(req.query())
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			if (query.hasOwnProperty(key)) {
				req.headers[header] = query[key]
				return next()
			}
		}
		return next()
	}
}