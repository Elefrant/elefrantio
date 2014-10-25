'use strict';

var Q = require('q'),
	util = require('elefrant-util'),
	actionsUtils = require('./utils'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

function checkMethod(method) {
	if (_.indexOf(['get', 'post', 'put', 'del', 'patch'], method) > -1) {
		return true;
	}

	return false;
}

function getAction(elefrant, api, strAction) {
	// var action = eval(strAction);





	console.log(elefrant.resolve(api.tos.v1).status);





	// elefrant.resolve(function (Help) {
	// 	console.log(song.chorus());
	// });
}

module.exports = function (elefrant, actionPath, api, callback) {
	var deferred = Q.defer();
	var routes = [],
		route,
		method;

	var enableActions = actionsUtils.getActions(actionPath, elefrant);

	_(glob.sync(path.join(actionPath, '**', 'routes', '**', '*.js')))
		.each(function (def, identity) {
			if (actionsUtils.checkIfEnableAction(def, enableActions)) {
				routes = _.union(routes, require(def));
			}
		});

	elefrant.chainware.get('beforeRoute');

	_(routes)
		.each(function (route, identity) {
			method = route.method.toLowerCase();
			if (method === 'delete') {
				method = 'del';
			}

			if (checkMethod(method)) {
				if (!route.action || !route.path) {
					deferred.reject(new Error('The route doesn\'t have property "action" or "path".'));
				} else {
					var params = {
						name: route.name || null,
						url: route.path,
						version: route.version || null
					};

					params = _.extend(params, elefrant.chainware.getParam('paramRoute'));

					var action = getAction(elefrant, api, route.action);

					// elefrant.server[method](params, getAction(api, route.action));
					//
					// if (elefrant.config.system.debug) {
					// 	elefrant.log('debug', 'Created route %s', route.path);
					// }
				}
			}
		});

	elefrant.chainware.get('afterRoute');

	deferred.resolve(routes);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};






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
