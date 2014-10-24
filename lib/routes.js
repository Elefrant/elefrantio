// 'use strict';
//
// var Q = require('q'),
// 	util = require('elefrant-util'),
// 	path = require('path'),
// 	glob = util.glob,
// 	_ = util.lodash,
// 	format = util.format;
//
// function getParentFolderAction(url) {
// 	url = url.split('/');
// 	delete url[url.length - 1];
// 	return url = url.join('/');
// }
//
// function getActions(actionPath, elefrant) {
// 	var actions = [],
// 		action,
// 		url;
//
// 	_(glob.sync(path.join(actionPath, '**', 'action.js')))
// 		.each(function (def, identity) {
// 			action = require(def);
// 			if (action.enable) {
// 				actions.push(getParentFolderAction(def));
//
// 				if (action.name && action.register) {
// 					elefrant.register(action.name, action.register);
// 				}
// 			}
// 		});
//
// 	return actions;
// }
//
// function checkIfEnableAction(value, inArray) {
// 	var found = false;
// 	_.map(inArray, function (val) {
// 		if (_.contains(value, val)) {
// 			return found = true;
// 		}
// 	});
// 	return found;
// }
//
// module.exports = function (elefrant, actionPath, actions, callback) {
// 	var deferred = Q.defer();
// 	var constrollers = {},
// 		action,
// 		name;
//
// 	var enableActions = getActions(actionPath, elefrant);
//
// 	_(glob.sync(path.join(actionPath, '**', 'controllers', '**', '*.js')))
// 		.each(function (def, identity) {
// 			action = require(def);
// 			if (checkIfEnableAction(def, enableActions)) {
// 				name = format.downlize(format.filename(path.basename(def)));
// 				if (constrollers[name]) {
// 					deferred.reject(new Error('The constroller ' + name + ' is duplicated. Check constrollers and change the name of file.'));
// 				} else {
// 					constrollers[name] = require(def);
// 				}
// 			}
// 		});
//
// 	deferred.resolve(constrollers);
// 	deferred.promise.nodeify(callback);
// 	return deferred.promise;
// };
//
//
//
//
//
//
//
//
//
// 'use strict';
//
// // Module dependencies.
// var _ = eRequire('app/lib/utils');
//
// module.exports = function (server, config) {
// 	// Load controllers
// 	var api = require('./Controller')(config);
//
// 	// Paths
// 	var routes_path = config.system.rootApp + '/config/routes',
// 		routes = [],
// 		route = null,
// 		method = null;
//
// 	// Bootstrap routes
// 	_.walk(routes_path, null, function (path, filename) {
// 		routes = _.extendArray(
// 			routes,
// 			require(path)(api, config)
// 		);
// 	});
//
// 	// Create each route
// 	for (var index in routes) {
// 		// Load route elements
// 		route = routes[index];
//
// 		// Show create routed
// 		if (config.system.debug) {
// 			config.log.debug('Route %s', route.path);
// 		}
//
// 		// Load route
// 		method = route.method.toLowerCase();
//
// 		// Check if method delete
// 		if (method === 'delete') method = 'del';
//
// 		// Check if methods is in the list
// 		if (['get', 'post', 'put', 'del', 'patch'].indexOf(method) > -1) {
// 			// Create route
// 			server[method]({
// 				name: route.name,
// 				url: route.path,
// 				version: route.version,
// 				auth: route.auth || null, // Check oauth2
// 				scopes: route.scopes || null, // Scopes allowed in route
// 				swagger: route.action.spec || null, // Swagger doc
// 				validation: route.action.validation || null, // Swagger doc and Validation
// 				models: route.action.models || null, // Swagger doc
// 				throttle: route.throttle || null, // Allow rate limit
// 				cache: route.cache || null, // Allow rate limit
// 			}, route.action.action);
// 		}
// 	}
//
// 	// Generate documentation and routes
// 	require('./Documentation')(server, config);
// };
