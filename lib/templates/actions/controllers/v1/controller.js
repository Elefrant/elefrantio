'use strict';

// Tos Actions
module.exports.v1 = function (config) {

	return {
		status: {
			action: function (req, res, next) {
				// Get status values
				var status = {
					name: config.server.name,
					version: config.server.version
				};

				// Send status
				res.send(status);
				next();
			}
		},

		//-----------------------------------------------------------------------------------

		tos: {
			action: function (req, res, next) {
				// Get params
				var tos = {
					tos: 'Terms of Service\n\n\nThese Terms of Service (\"Terms\") govern your access to and use of the services, including our various websites, SMS, APIs, email notifications, applications, buttons, and widgets.'
				};

				// Send tos
				res.send(tos);
				next();
			}
		}
	}
};
