'use strict';

var restify = require('restify'),
	Q = require('q'),
	util = require('elefrant-util'),
	_ = util.lodash,
	fs = require('fs');

module.exports = function (elefrant, callback) {
	var deferred = Q.defer();

	var configServer = {
		name: elefrant.config.server.name,
		version: elefrant.config.server.version,
		handleUpgrades: elefrant.config.server.handleUpgrades || false
	};

	if (elefrant.config.ssl && elefrant.config.ssl.enable) {
		if (elefrant.config.ssl.key && (elefrant.config.ssl.key.length() >= 1)) {
			configServer.key = fs.readFileSync(elefrant.config.ssl.key);
		}

		if (elefrant.config.ssl.cert && (elefrant.config.ssl.cert.length() >= 1)) {
			configServer.cert = fs.readFileSync(elefrant.config.ssl.cert);
		}
	}

	// TODO: Load some components
	// configServer = _.extend(configServer, elefrant.chainware.get('paramServer', configServer));

	// elefrant.chainware.get('beforeServer', elefrant);

	// Create server
	var server = restify.createServer(configServer);

	// Trailing / characters
	server.pre(restify.pre.sanitizePath());

	// Ensures that the server can respond to what the client asked for
	server.use(restify.acceptParser(server.acceptable));

	// Parses out the Authorization header (HTTP Basic Auth and HTTP Signature schemes are supported)
	server.use(restify.authorizationParser());

	// Parses out the HTTP Date header (if present) and checks for clock skew
	server.use(restify.dateParser());

	// Parses the HTTP query string (i.e., /foo?id=bar&name=mark)
	server.use(restify.queryParser());

	// Logger with the current request
	server.use(restify.requestLogger());

	// If the client sends an accept-encoding: gzip header, then the server will automatically gzip all response data
	server.use(restify.gzipResponse());

	// Supports checking the query string for callback or jsonp and ensuring that the content-type is appropriately set if JSONP params are in place.
	server.use(restify.jsonp());

	// Add CORS Support
	//restify.CORS.ALLOW_HEADERS.push( 'my-custom-header' );
	server.use(restify.CORS(elefrant.config.server.cors));
	server.use(restify.fullResponse());

	// Blocks your chain on reading and parsing the HTTP request body
	server.use(restify.bodyParser({
		mapParams: false
	}));

	// elefrant.chainware.get('afterServer', elefrant);

	deferred.resolve(server);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
