'use strict';

var util = require('elefrant-util'),
	chalk = util.chalk;

module.exports = function (elefrant) {
	var colors = {
		info: 'green',
		help: 'cyan',
		warn: 'yellow',
		debug: 'blue',
		error: 'bgRed',
		trace: 'magenta'
	};

	try {
		elefrant.resolve(function (logger) {
			return logger;
		});
	} catch (err) {

		return function (level, message) {
			level = level || 'info';

			var color = chalk[colors[level].toLowerCase()](level.toUpperCase() + ': ');
			Array.prototype.shift.apply(arguments);
			arguments[0] = color + message;

			console.log.apply(this, arguments);
		};
	}
};
