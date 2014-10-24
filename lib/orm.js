'use strict';

var orm = require('elefrant-orm'),
	util = require('elefrant-util'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

module.exports = function (elefrant, actionPath, callback) {
	var models = {},
		name;

	_(glob.sync(path.join(actionPath, '**', 'models', '**/*.js')))
		.each(function (def, identity) {
			name = format.capitalize(format.filename(path.basename(def)));
			if (models[name]) {
				callback(new Error('The model ' + name + ' is duplicated. Check models and change the name of file.'));
			}

			models[name] = _.extend(elefrant.config.models, require(def));
		});

	var options = {
		adapters: elefrant.config.adapters,
		collections: models,
		connections: elefrant.config.connections
	};

	orm(options, function (err, models) {
		if (err) {
			callback(err);
		} else {
			callback(null, models);
		}
	});
};
