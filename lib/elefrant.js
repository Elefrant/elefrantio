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

	// Load and register system variables
	Elefrant.Singleton.config = config(options);
	Elefrant.Singleton.register('config', Elefrant.Singleton.config);
	Elefrant.Singleton.version = Elefrant.Singleton.config.server.version || Elefrant.Singleton.version;
	Elefrant.Singleton.name = Elefrant.Singleton.config.server.name || Elefrant.Singleton.name;

	// Load models and collections
	orm(Elefrant.Singleton, options.actionPath, function (err, models) {
		if (err) {
			callback(err);
		} else {
			Elefrant.Singleton.register('collections', models);

			component(Elefrant.Singleton, options.componentPath).then(function (components) {
					if (_.isEmpty(components) && Elefrant.Singleton.config.system.debug) {
						console.log('WARNING: register compoennts in...');
					}
					Elefrant.Singleton.register('components', components);
					return bootstrap(Elefrant.Singleton);
				})
				.then(function (server) {
					console.log('server', server);
				}).fail(function (err) {
					callback(err);
				}).done();




			// bootstrap(Elefrant.Singleton, function (err, server) {
			// 	if (err) {
			// 		callback(err);
			// 	};
			// });
			// console.log('bootstrap', bootstrap);
			// bootstrap(Elefrant.Singleton).then(function (server) {
			// 	console.log(server);
			// }, function (err) {
			// 	console.log(err);
			// });
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

// ----------- Start components

Elefrant.prototype.chainware = {
	add: function () {
		middleware[event].splice(weight, 0, {
			weight: weight,
			func: func
		});
		middleware[event].join();
		middleware[event].sort(function (a, b) {
			if (a.weight < b.weight) {
				a.next = b.func;
			} else {
				b.next = a.func;
			}
			return (a.weight - b.weight);
		});
	},

	get: function () {
		// middleware[operator][index].func.apply(this, args);
	},

	getParam: function () {

	},

	list: function (event) {
		if (event) {
			return middleware[event];
		} else {
			return middleware;
		}
	}
};






// add: function (event, weight, func) {
// 		middleware[event].splice(weight, 0, {
// 			weight: weight,
// 			func: func
// 		});
// 		middleware[event].join();
// 		middleware[event].sort(function (a, b) {
// 			if (a.weight < b.weight) {
// 				a.next = b.func;
// 			} else {
// 				b.next = a.func;
// 			}
// 			return (a.weight - b.weight);
// 		});
// 	},
//
// 	before: function (req, res, next) {
// 		if (!middleware.before.length) return next();
// 		this.chain('before', 0, req, res, next);
// 	},
//
// 	after: function (req, res, next) {
// 		if (!middleware.after.length) return next();
// 		this.chain('after', 0, req, res, next);
// 	},
//
// 	chain: function (operator, index, req, res, next) {
// 		var args = [req, res,
// 			function () {
// 				if (middleware[operator][index + 1]) {
// 					this.chain('before', index + 1, req, res, next);
// 				} else {
// 					next();
// 				}
// 			}
// 		];
//
// 		middleware[operator][index].func.apply(this, args);
// 	}


// ----------- End components

module.exports = exports = new Elefrant();
