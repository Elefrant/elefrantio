'use strict';

// __name__ Actions
module.exports.v1 = function (config, error) {

	return {
		status: {
			action: function (req, res, next) {
				// Get status values
				var status = {
					name: 'test value'
				};

				// Send status
				res.send(status);
				next();
			}
		},
	}
};
