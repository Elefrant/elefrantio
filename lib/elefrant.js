'use strict';

var container = require('dependable').container(),
	EventEmitter = require('events').EventEmitter,
	path = require('path'),
	util = require('elefrant-util'),
	glob = util.glob,
	chalk = util.chalk,
	Q = require('q'),
	config = require('./config'),
	orm = require('./orm'),
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
    console.log(Elefrant.Singleton.config);
	// Elefrant.Singleton.register('config', Elefrant.Singleton.config);
    //
	// // Update version and name of elefrant instance
	// Elefrant.Singleton.version = Elefrant.Singleton.config.server.version || Elefrant.Singleton.version;
	// Elefrant.Singleton.name = Elefrant.Singleton.config.server.name || Elefrant.Singleton.name;
	// console.log('bootstrap', bootstrap);
	// // Load models and collections
	// orm(Elefrant.Singleton, options, function (err, models) {
	// 	if (err) {
	// 		callback(err);
	// 	}
    //
	// 	// Bootstrap server
	// 	// bootstrap(Elefrant.Singleton, function (err, server) {
	// 	// 	if (err) {
	// 	// 		callback(err);
	// 	// 	};
	// 	// });
	// 	console.log('bootstrap', bootstrap);
	// 	// bootstrap(Elefrant.Singleton).then(function (server) {
	// 	// 	console.log(server);
	// 	// }, function (err) {
	// 	// 	console.log(err);
	// 	// });
    //
	// });



	// mongoose.set('debug', defaultConfig.mongoose && defaultConfig.mongoose.debug);
	//
	// var database = mongoose.connect(defaultConfig.db || '', defaultConfig.dbOptions || {}, function (err) {
	// 	if (err) {
	// 		console.error('Error:', err.message);
	// 		return console.error('**Could not connect to MongoDB. Please ensure mongod is running and restart MEAN app.**');
	// 	}
	//
	// 	// Register database dependency
	// 	Meanio.Singleton.register('database', {
	// 		connection: database
	// 	});
	//
	// 	Meanio.Singleton.config = new Config(function (err, config) {
	// 		// Bootstrap Models, Dependencies, Routes and the app as an express app
	// 		var app = require('./bootstrap')(options, database);
	//
	// 		// Listen on http.port (or port as fallback for old configs)
	// 		var httpServer = http.createServer(app);
	// 		Meanio.Singleton.register('http', httpServer);
	// 		httpServer.listen(config.http ? config.http.port : config.port, config.hostname);
	//
	// 		if (config.https && config.https.port) {
	// 			var httpsOptions = {
	// 				key: fs.readFileSync(config.https.ssl.key),
	// 				cert: fs.readFileSync(config.https.ssl.cert)
	// 			};
	//
	// 			var httpsServer = https.createServer(httpsOptions, app);
	// 			Meanio.Singleton.register('https', httpsServer);
	// 			httpsServer.listen(config.https.port);
	// 		}
	//
	// 		findModules(function () {
	// 			enableModules();
	// 		});
	//
	// 		Meanio.Singleton.aggregate('js', null);
	//
	// 		Meanio.Singleton.name = config.app.name;
	// 		Meanio.Singleton.app = app;
	//
	// 		Meanio.Singleton.menus = new Meanio.Singleton.Menus();
	//
	// 		callback(app, config);
	// 	});
	//
	// 	Meanio.Singleton.active = true;
	// 	Meanio.Singleton.options = options;
	// });

	callback(null, null);
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


// ----------- End components

module.exports = exports = new Elefrant();
