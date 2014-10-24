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
				}

				if (component.beforeServer) {
					console.log('registra beforeServer');
				}

				if (component.afterServer) {
					console.log('registra afterServer');
				}

				if (component.paramServer) {
					console.log('registra paramServer');
				}

				if (component.beforeRoute) {
					console.log('registra beforeRoute');
				}

				if (component.afterRoute) {
					console.log('registra afterRoute');
				}

				if (component.paramRoute) {
					console.log('registra paramRoute');
				}

				if (component.register) {
					console.log('registra register');
				}
			}
		});

	deferred.resolve(componentsList);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
