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

	configServer = _.extend(configServer, elefrant.chainware.getParam('paramServer'));

	elefrant.chainware.get('beforeServer');

	var server = restify.createServer(configServer);

	// Trailing '/' characters in the routes. Automatically cleans up the URL
	if (elefrant.config.server.sanitizePath) {
		server.pre(restify.pre.sanitizePath());
	}

	// Hanging requests with bodyParser and async handlers
	if (elefrant.config.server.pause) {
		server.pre(restify.pre.pause());
	}

	// Checks whether the user agent is curl. If it is, it sets the Connection header to "close" and removes the "Content-Length" header.
	if (elefrant.config.server.userAgentConnection) {
		server.pre(restify.pre.userAgentConnection());
	}

	// Ensures that the server can respond to what the client asked for
	server.use(restify.acceptParser(elefrant.config.server.acceptable || server.acceptable));

	// Parses out the Authorization header (HTTP Basic Auth and HTTP Signature schemes are supported)
	server.use(restify.authorizationParser());

	// Parses out the HTTP Date header (if present) and checks for clock skew
	server.use(restify.dateParser(elefrant.config.server.clockSkew));

	// Parses the HTTP query string (i.e., /foo?id=bar&name=mark)
	server.use(restify.queryParser());

	// If the client sends an accept-encoding: gzip header, then the server will automatically gzip all response data
	if (elefrant.config.server.allowGzip) {
		server.use(restify.gzipResponse());
	}

	// Supports checking the query string for callback or jsonp and ensuring that the content-type is appropriately set if JSONP params are in place.
	if (elefrant.config.server.jsonp) {
		server.use(restify.jsonp());
	}

	// Add CORS Support
	server.use(restify.CORS(elefrant.config.server.cors));

	// Full response in the header
	server.use(restify.fullResponse());

	// Blocks your chain on reading and parsing the HTTP request body
	server.use(restify.bodyParser({
		mapParams: false
	}));
	// 	server.use(restify.bodyParser({
	//     maxBodySize: 0,
	//     mapParams: true,
	//     mapFiles: false,
	//     overrideParams: false,
	//     multipartHandler: function(part) {
	//         part.on('data', function(data) {
	//           /* do something with the multipart data */
	//         });
	//     },
	//     multipartFileHandler: function(part) {
	//         part.on('data', function(data) {
	//           /* do something with the multipart file data */
	//         });
	//     },
	//     keepExtensions: false,
	//     uploadDir: os.tmpdir()
	//  }));

	elefrant.chainware.get('afterServer', server, restify);

	deferred.resolve(server);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
