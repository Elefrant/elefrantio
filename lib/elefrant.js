'use strict';

var container = require('dependable').container(),
	EventEmitter = require('events').EventEmitter,
	path = require('path'),
	util = require('elefrant-util'),
	glob = util.glob,
	chalk = util.chalk,
	_ = util.lodash,
	Q = require('q'),
	config = require('./config'),
	orm = require('./orm'),
	component = require('./components'),
	logger = require('./logger'),
	bootstrap = require('./bootstrap');

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

Elefrant.prototype.init = function (callback) {
	if (this.active) return this;

	var options = {
		configPath: path.join(__dirname, '../../..', 'config'),
		actionPath: path.join(__dirname, '../../..', 'actions'),
		componentPath: path.join(__dirname, '../../..', 'components')
	}

	Elefrant.Singleton.config = config(options);
	Elefrant.Singleton.register('config', Elefrant.Singleton.config);
	Elefrant.Singleton.version = Elefrant.Singleton.config.server.version || Elefrant.Singleton.version;
	Elefrant.Singleton.name = Elefrant.Singleton.config.server.name || Elefrant.Singleton.name;

	orm(Elefrant.Singleton, options.actionPath, function (err, models) {
		if (err) {
			Elefrant.Singleton.log = logger(Elefrant.Singleton);
			callback(err);
		} else {
			Elefrant.Singleton.register('collections', models);
			Elefrant.Singleton.register('elefrant', Elefrant.Singleton);

			component(Elefrant.Singleton, options.componentPath).then(function (components) {
					Elefrant.Singleton.log = logger(Elefrant.Singleton);

					if (_.isEmpty(components) && Elefrant.Singleton.config.system.debug) {
						Elefrant.Singleton.log('warn', 'You didn\'t load any component. Try components from http://www.elefrant.com');
					}
					Elefrant.Singleton.register('components', components);
					return bootstrap(Elefrant.Singleton);
				})
				.then(function (server) {
					Elefrant.Singleton.register('server', server);

					callback(null, server);
				}).fail(function (err) {
					callback(err);
				}).done();
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

module.exports = exports = new Elefrant();
