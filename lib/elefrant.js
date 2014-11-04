'use strict';

var path = require('path'),
		fs = require('fs'),
		moniker = require('moniker'),
		container = require('dependable').container(),
		EventEmitter = require('events').EventEmitter,
		_ = require('elefrant-util').lodash,
		config = require('./config'),
		orm = require('./orm'),
		component = require('./components'),
		logger = require('./logger'),
		bootstrap = require('./bootstrap'),
		actions = require('./actions'),
		routes = require('./routes');

var events = new EventEmitter(),
		middleware = {
			beforeServer: [],
			afterServer: [],
			paramServer: [],
			beforeRoute: [],
			afterRoute: [],
			paramRoute: [],
		};

function Elefrant() {
	if (this.active) return;
	Elefrant.Singleton = this;
	this.events = events;
	this.version = require('../package').version;
	this.name = require('../package').name;
	this.active = false;
}
Elefrant.events = events;

Elefrant.prototype.config = {};

Elefrant.prototype.getConfigComp = function (nameOfComp, configComp) {
	var elefrant = Elefrant.Singleton;
	configComp = configComp || {};

	if (elefrant.config && elefrant.config[nameOfComp]) {
		configComp = _.extend(configComp, elefrant.config[nameOfComp]);
	}

	return configComp;
};

Elefrant.prototype.init = function (callback) {
	if (this.active) return this;

	var options = {
				configPath: path.join(__dirname, '../../..', 'config'),
				actionPath: path.join(__dirname, '../../..', 'actions'),
				componentPath: path.join(__dirname, '../../..', 'components')
			},
			elefrant = Elefrant.Singleton;
	elefrant.log = logger(elefrant);
	elefrant.debug = logger.type(elefrant, 'debug');
	elefrant.info = logger.type(elefrant, 'info');
	elefrant.error = logger.type(elefrant, 'error');

	if(!fs.existsSync(options.configPath)) {
		elefrant.log('error', 'Ouh! Couldn\'t find config path.');
	}
	if(!fs.existsSync(options.actionPath)) {
		elefrant.log('error', 'Ouh! Couldn\'t find actions path.');
	}
	if(!fs.existsSync(options.componentPath)) {
		elefrant.log('error', 'Ouh! Couldn\'t find components path.');
	}

	elefrant.config = config(options);
	elefrant.register('config', elefrant.config);
	elefrant.log('debug', 'Load configuration');
	elefrant.register('elefrant', elefrant);

	elefrant.version = elefrant.config.server.version = elefrant.config.server.version || elefrant.version;
	elefrant.name = elefrant.config.server.name = elefrant.config.server.name || moniker.choose() || elefrant.name;

	orm(elefrant, options.actionPath, function (err, models) {
		if (err) {
			callback(err);
		} else {
			component(elefrant, options.componentPath).then(function (components) {
				elefrant.log = logger(elefrant);
				if (_.isEmpty(components)) {
					elefrant.log('help', 'Ouh! Couldn\'t find any component. Try out components in http://www.elefrant.com/#/components.');
				}
				return bootstrap(elefrant);
			})
					.then(function (server) {
						elefrant.server = server;
						return actions(elefrant, options.actionPath);
					})
					.then(function (actions) {
						if (_.isEmpty(actions)) {
							elefrant.log('warn', 'Couldn\'t find any action. Check if you created them in the correct path.');
						}
						return routes(elefrant, options.actionPath, actions);
					})
					.then(function (routes) {
						if (_.isEmpty(routes)) {
							elefrant.log('warn', 'Couldn\'t find any route. Check if you created them in the correct path.');
						}
						elefrant.server.listen(elefrant.config.server.port, elefrant.config.server.host, function onListening() {
							elefrant.active = true;
							callback(null, elefrant.server);
						});
					})
					.catch(function (err) {
						callback(err);
					})
					.done();
		}
	});
};

Elefrant.prototype.status = function () {
	return {
		name: this.name,
		version: this.version,
		active: this.active
	};
};

Elefrant.prototype.get = container.get;

Elefrant.prototype.register = container.register;

Elefrant.prototype.resolve = container.resolve;

Elefrant.prototype.load = container.load;

Elefrant.prototype.list = container.list;

// ----------- Start components

Elefrant.prototype.chainware = {
	add: function (event, weight, func) {
		middleware[event].splice(weight, 0, {
			weight: weight,
			func: func
		});
		middleware[event].join();
		middleware[event].sort(function (a, b) {
			return (a.weight - b.weight);
		});
	},

	get: function (event) {
		if (_.indexOf(['beforeServer', 'afterServer', 'beforeRoute', 'afterRoute'], event) > -1) {
			var args = arguments;
			args[0] = Elefrant.Singleton;

			_(middleware[event])
					.each(function (def, identity) {
						def.func.apply(this, args);
					});

		}
		return true;
	},

	getParam: function (event) {
		var params = {};
		if (_.indexOf(['paramServer', 'paramRoute'], event) > -1) {
			var args = arguments;
			args[0] = Elefrant.Singleton;

			_(middleware[event])
					.each(function (def, identity) {
						params = _.extend(params, def.func.apply(this, args));
					});
		}
		return params;
	},

	list: function (event) {
		if (event) {
			return middleware[event];
		} else {
			return middleware;
		}
	}
};

// ----------- End components

module.exports = new Elefrant();
