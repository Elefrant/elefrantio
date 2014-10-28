'use strict';

var orm = require('elefrant-orm'),
		util = require('elefrant-util'),
		path = require('path'),
		glob = util.glob,
		_ = util.lodash,
		format = util.format;

module.exports = function (elefrant, actionPath, callback) {
	var models = {},
			model,
			name;

	_(glob.sync(path.join(actionPath, '**', 'models', '**/*.js')))
			.each(function (def, identity) {
				name = format.capitalize(format.filename(path.basename(def)));
				if (models[name]) {
					callback(new Error('The model <' + name + '> is duplicate, check and change the name of the conflicted file.'));
				}

				model = _.extend(elefrant.config.models, require(def));
				if(model) {
					models[name] = model;
				}
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
			_(models.collections)
					.each(function (def, identity) {
						elefrant.register(format.capitalize(identity), def);
					});

			callback(null, models);
		}
	});
};
