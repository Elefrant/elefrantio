'use strict';

var util = require('elefrant-util'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

function getParentFolderAction(url) {
	url = url.split('/');
	delete url[url.length - 1];
	return url.join('/');
}

function getActions(actionPath, elefrant) {
	var actions = [],
		action;

	_(glob.sync(path.join(actionPath, '**', 'action.js')))
		.each(function (def, identity) {
			action = require(def);
			if (action.enable) {
				actions.push(getParentFolderAction(def));

				if (action.name && action.register) {
					elefrant.register(format.downlize(action.name), action.register);
				}
			}
		});

	return actions;
}
module.exports.getActions = getActions;

function checkIfEnableAction(value, inArray) {
	var found = false;
	_.map(inArray, function (val) {
		if (_.contains(value, val)) {
			found = true;
			return found;
		}
	});
	return found;
}
module.exports.checkIfEnableAction = checkIfEnableAction;
