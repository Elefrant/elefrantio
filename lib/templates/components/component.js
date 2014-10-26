'use strict';

var lib = require('./lib/__name__.lib');

module.exports = {
	// True if enabled component
	enable: true,

	// Name of component
	name: '__name__',

	// Actions to do before Server creation
	beforeServer: function (elefrant) {
		// Actions and functions
		__name__.lib();
	},
	// OR
	// beforeServer: {
	// 	weight: 1,
	// 	func: function (elefrant) {}
	// },

	// Actions to do after Server creation
	afterServer: function (elefrant, server, restify) {
		// Actions and functions
	},
	// OR
	// afterServer: {
	// 	weight: 1,
	// 	func: function (elefrant, server, restify) {}
	// },

	// Variables to add when the server is creating
	paramServer: function (elefrant) {
		// Actions and functions
	},

	// Actions to do before create routes
	beforeRoute: function (elefrant, server) {
		// Actions and functions
	},
	// OR
	// beforeRoute: {
	// 	weight: 1,
	// 	func: function (elefrant, server) {}
	// },

	// Actions to do after create routes
	afterRoute: function (elefrant) {
		// Actions and functions
	},
	// OR
	// afterRoute: {
	// 	weight: 1,
	// 	func: function (elefrant) {}
	// },

	// Variables to add when is creating each route
	paramRoute: function (elefrant, route) {
		// Actions and functions
	},

	// Function to register to use in controllers or actions
	register: function (elefrant) {
		// Actions and functions
	}
};
