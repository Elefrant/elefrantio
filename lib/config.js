'use strict';

var util = require('elefrant-util'),
	path = require('path'),
	glob = util.glob,
	_ = util.lodash,
	format = util.format;

module.exports = function (options) {
	var configPath = process.cwd() + '/config/',
		config = {},
		env = process.env.NODE_ENV || 'development',
		name;

	var configCommonFiles = {};
	_(glob.sync(path.join(options.configPath, '/*.js')))
		.each(function (def, identity) {
			name = format.downlize(format.filename(path.basename(def)));
			configCommonFiles[name] = require(def);
		});

	var configCommonEnvFiles = {};
	_(glob.sync(path.join(options.configPath, 'env', env, '**/*.js')))
		.each(function (def, identity) {
			name = format.downlize(format.filename(path.basename(def)));
			configCommonEnvFiles[name] = require(def);
		});

	var configActionFiles = {};
	_(glob.sync(path.join(options.actionPath, 'config', '/*.js')))
		.each(function (def, identity) {
			name = format.downlize(format.filename(path.basename(def)));
			configCommonFiles[name] = require(def);
		});

	var configActionEnvFiles = {};
	_(glob.sync(path.join(options.actionPath, 'config', 'env', env, '**/*.js')))
		.each(function (def, identity) {
			name = format.downlize(format.filename(path.basename(def)));
			configActionEnvFiles[name] = require(def);
		});

	config = _.extend({
		env: env
	}, configCommonFiles, configActionFiles, configCommonEnvFiles, configActionEnvFiles);

	config.server.port = process.env.PORT || config.server.port;
	config.server.host = process.env.HOST || config.server.host;

	return config;
};
