'use strict';

var Q = require('q'),
		util = require('elefrant-util'),
		restify = require('restify'),
		actionsUtils = require('./utils'),
		path = require('path'),
		glob = util.glob,
		_ = util.lodash;

function checkMethod(method) {
	if (_.indexOf(['get', 'post', 'put', 'del', 'patch', 'head', 'options'], method) > -1) {
		return true;
	}
	return false;
}

function getAction(elefrant, api, strAction) {
	var args = strAction.split('.');
	return elefrant.resolve(api[args[0]][args[1]])[args[2]];
}

module.exports = function (elefrant, actionPath, api, callback) {
	var deferred = Q.defer();
	var routes = [],
			method;

	var enableActions = actionsUtils.getActions(actionPath, elefrant);

	_(glob.sync(path.join(actionPath, '**', 'routes', '**', '*.js')))
			.each(function (def, identity) {
				if (actionsUtils.checkIfEnableAction(def, enableActions)) {
					routes = _.union(routes, require(def));
				}
			});

	elefrant.chainware.get('beforeRoute', elefrant.server, restify);

	_(routes)
			.each(function (route, identity) {
				method = route.method.toLowerCase() || 'get';
				if (method === 'delete') {
					method = 'del';
				}

				if (checkMethod(method)) {
					if (!route.action || !route.path) {
						deferred.reject(new Error('The route doesn\'t have "action" or "path" property.'));
					} else {
						var params = {
							name: route.name || null,
							url: route.path,
							version: route.version || [elefrant.config.server.version]
						};

						var action = getAction(elefrant, api, route.action);

						params = _.extend(params, elefrant.chainware.getParam('paramRoute', route, action));

						elefrant.server[method](params, action.action);

						elefrant.log('debug', 'Created route %s', route.path);
					}
				}
			});

	elefrant.chainware.get('afterRoute');

	deferred.resolve(routes);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
