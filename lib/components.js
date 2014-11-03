'use strict';

var Q = require('q'),
	util = require('elefrant-util'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

function addEvent(event, component, elefrant) {
	if (component[event]) {
		if (_.isFunction(component[event])) {
			elefrant.chainware.add(event, 5, component[event]);
		} else if (component[event].func) {
			elefrant.chainware.add(event, component[event].weight || 5, component[event].func);
		} else {
			throw new Error('@' + event + ' from component <' + component.name + '> is not defined properly.');
		}
	}

	return true;
}

function addParam(event, component, elefrant) {
	if (component[event]) {
		if (_.isFunction(component[event])) {
			elefrant.chainware.add(event, 5, component[event]);
		} else {
			throw new Error('@' + event + ' from component <' + component.name + '> is not defined properly.');
		}
	}

	return true;
}


module.exports = function (elefrant, componentPath, callback) {
	var deferred = Q.defer();

	var componentsList = {},
		component;

	_(glob.sync(path.join(componentPath, '**', 'component.js')))
		.each(function (def, identity) {
			component = require(def);
			if (component.enable) {
				if (!component.name) {
					deferred.reject(new Error('The component <' + def + '> don\'t have "name" property.'));
				} else {
					componentsList[component.name] = def;

					try {
						addEvent('beforeServer', component, elefrant);
						addEvent('beforeServer', component, elefrant);
						addEvent('afterServer', component, elefrant);
						addParam('paramServer', component, elefrant);
						addEvent('beforeRoute', component, elefrant);
						addEvent('afterRoute', component, elefrant);
						addParam('paramRoute', component, elefrant);
					} catch (err) {
						deferred.reject(err);
					}

					if (component.register) {
						elefrant.register(format.downlize(component.name), component.register);
						elefrant.log('debug', 'Register component %s', format.downlize(component.name));
					}
				}
			}
		});

	deferred.resolve(componentsList);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
