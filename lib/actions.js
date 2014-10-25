'use strict';

var Q = require('q'),
	util = require('elefrant-util'),
	actionsUtils = require('./utils'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

module.exports = function (elefrant, actionPath, callback) {
	var deferred = Q.defer();
	var controllers = {},
		name;

	var enableActions = actionsUtils.getActions(actionPath, elefrant);

	_(glob.sync(path.join(actionPath, '**', 'controllers', '**', '*.js')))
		.each(function (def, identity) {
			if (actionsUtils.checkIfEnableAction(def, enableActions)) {
				name = format.downlize(format.filename(path.basename(def)));
				if (controllers[name]) {
					deferred.reject(new Error('The controller <' + name + '> is duplicate, check and change the name of the conflicted file.'));
				} else {
					controllers[name] = require(def);
				}
			}
		});

	deferred.resolve(controllers);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
