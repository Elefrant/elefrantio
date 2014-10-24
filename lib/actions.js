'use strict';

var orm = require('elefrant-orm'),
	Q = require('q'),
	util = require('elefrant-util'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

function getParentFolderAction(url) {
	url = url.split('/');
	delete url[url.length - 1];
	return url = url.join('/');
}

function getActions(actionPath, elefrant) {
	var actions = [],
		action,
		url;

	_(glob.sync(path.join(actionPath, '**', 'action.js')))
		.each(function (def, identity) {
			action = require(def);
			if (action.enable) {
				actions.push(getParentFolderAction(def));

				if (action.name && action.register) {
					elefrant.register(action.name, action.register);
				}
			}
		});

	return actions;
}

function checkIfEnableAction(value, inArray) {
	var found = false;
	_.map(inArray, function (val) {
		if (_.contains(value, val)) {
			return found = true;
		}
	});
	return found;
}

module.exports = function (elefrant, actionPath, callback) {
	var deferred = Q.defer();
	var constrollers = {},
		action,
		name;

	var enableActions = getActions(actionPath, elefrant);

	_(glob.sync(path.join(actionPath, '**', 'controllers', '**', '*.js')))
		.each(function (def, identity) {
			action = require(def);
			if (checkIfEnableAction(def, enableActions)) {
				name = format.downlize(format.filename(path.basename(def)));
				if (constrollers[name]) {
					deferred.reject(new Error('The constroller ' + name + ' is duplicated. Check constrollers and change the name of file.'));
				} else {
					constrollers[name] = require(def);
				}
			}
		});

	deferred.resolve(constrollers);
	deferred.promise.nodeify(callback);
	return deferred.promise;
};
