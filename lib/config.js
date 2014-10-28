'use strict';

var util = require('elefrant-util'),
		path = require('path'),
		glob = util.glob,
		_ = util.lodash,
		format = util.format;

function getProp(pathConfigFile) {
	var config = {},
			name;
	_(glob.sync(pathConfigFile))
			.each(function (def, identity) {
				name = format.downlize(format.filename(path.basename(def)));
				config[name] = require(def);
			});
	return config;
}

module.exports = function (options) {
	var env = process.env.NODE_ENV || 'development';

	var configCommonFiles = getProp(path.join(options.configPath, '/*.js')),
			configCommonEnvFiles = getProp(path.join(options.configPath, 'env', env, '**/*.js')),
			configActionFiles = getProp(path.join(options.actionPath, 'config', '/*.js')),
			configActionEnvFiles = getProp(path.join(options.actionPath, 'config', 'env', env, '**/*.js'));

	var config = _.extend({
		env: env,
		server: {
			port: 3100,
			host: 'localhost'
		},
		system: {
			debug: false,
		}
	}, configCommonFiles, configActionFiles, configCommonEnvFiles, configActionEnvFiles);

	config.server.port = process.env.PORT || config.server.port;
	config.server.host = process.env.HOST || config.server.host;

	return config;
};
