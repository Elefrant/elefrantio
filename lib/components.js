'use strict';

var orm = require('elefrant-orm'),
	Q = require('q'),
	util = require('elefrant-util'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

module.exports = function (elefrant, componentPath, callback) {
	var deferred = Q.defer();

	var componentsList = {},
		component,
		name;

	_(glob.sync(path.join(componentPath, '**', 'component.js')))
		.each(function (def, identity) {
			component = require(def);
			if (component.enable) {
				if (!component.name) {
					deferred.reject(new Error('The component <' + def + '> don\'t have property "name".'));
				} else {
					componentsList[component.name] = def;

					if (component.beforeServer) {
						if (_.isFunction(component.beforeServer)) {
							elefrant.chainware.add('beforeServer', 5, component.beforeServer);
						} else if (component.beforeServer.func) {
							elefrant.chainware.add('beforeServer', component.beforeServer.weight || 5, component.beforeServer);
						} else {
							deferred.reject(new Error('@beforeServer from component <' + def + '> is not defined properly.'));
						}
					}

					if (component.afterServer) {
						if (_.isFunction(component.afterServer)) {
							elefrant.chainware.add('afterServer', 5, component.afterServer);
						} else if (component.afterServer.func) {
							elefrant.chainware.add('afterServer', component.afterServer.weight || 5, component.afterServer);
						} else {
							deferred.reject(new Error('@afterServer from component <' + def + '> is not defined properly.'));
						}
					}

					if (component.paramServer) {
						if (_.isFunction(component.paramServer)) {
							elefrant.chainware.add('paramServer', 5, component.paramServer);
						} else {
							deferred.reject(new Error('@paramServer from component <' + def + '> is not defined properly.'));
						}
					}

					if (component.beforeRoute) {
						if (_.isFunction(component.beforeRoute)) {
							elefrant.chainware.add('beforeRoute', 5, component.beforeRoute);
						} else if (component.beforeRoute.func) {
							elefrant.chainware.add('beforeRoute', component.beforeRoute.weight || 5, component.beforeRoute);
						} else {
							deferred.reject(new Error('@beforeRoute from component <' + def + '> is not defined properly.'));
						}
					}

					if (component.afterRoute) {
						if (_.isFunction(component.afterRoute)) {
							elefrant.chainware.add('afterRoute', 5, component.afterRoute);
						} else if (component.afterRoute.func) {
							elefrant.chainware.add('afterRoute', component.afterRoute.weight || 5, component.afterRoute);
						} else {
							deferred.reject(new Error('@afterRoute from component <' + def + '> is not defined properly.'));
						}
					}

					if (component.paramRoute) {
						if (_.isFunction(component.paramRoute)) {
							elefrant.chainware.add('paramRoute', 5, component.paramRoute);
						} else {
							deferred.reject(new Error('@paramRoute from component <' + def + '> is not defined properly.'));
						}
					}

					if (component.register) {
						elefrant.register(component.name, component.register);
					}
				}
			}
		});

	deferred.resolve(componentsList);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
