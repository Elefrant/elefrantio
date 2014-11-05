'use strict';

var orm = require('elefrant-orm'),
		util = require('elefrant-util'),
		path = require('path'),
		glob = util.glob,
		_ = util.lodash,
		format = util.format;

module.exports = function (elefrant, actionPath, callback) {
	var modelsCollection = {},
			name,
			model;

	_(glob.sync(path.join(actionPath, '**', 'models', '**/*.js')))
			.each(function (def, identity) {
				name = (format.filename(path.basename(def))).toLowerCase();
				if (modelsCollection[name]) {
					callback(new Error('The model <' + name + '> is duplicate, check and change the name of the conflicted file.'));
				}
				model = _.clone(_.extend(elefrant.config.models, require(def)));
				if(model) {
					modelsCollection[name] = model;
				}

			});

	var options = {
		adapters: elefrant.config.adapters,
		collections: modelsCollection,
		connections: elefrant.config.connections
	};

	orm(options, function (err, models) {
		if (err) {
			callback(err);
		} else {
			_(models.collections)
					.each(function (def, identity) {
						elefrant.register(format.capitalize(identity), def);
						elefrant.log('debug', 'Register model %s', format.capitalize(identity));
					});

			callback(null, models);
		}
	});
};
