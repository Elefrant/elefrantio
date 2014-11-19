'use strict';

var errors = require('node-restify-errors'),
	util = require('elefrant-util'),
	_ = util.lodash;

module.exports = function () {
	var ormErrors = {
		OrmError: function(error, type) {

			switch(type) {
				case 'log':
					return new errors.InvalidContentError(error.toLog());
					break;
				case 'inspect':
					return new errors.InvalidContentError(error);
					break;
				case 'string':
					return new errors.InvalidContentError(error.toString());
					break;
				default: // json
					var err = error.toJSON();

					if(err.status === 500) {
						if(err.raw.name === 'MongoError') {
							if(err.raw.code ===  11000) {
								return new errors.InvalidContentError('Duplicate element.');
							}
						}

						return new errors.InternalError(err.summary);
					} else if(err.status === 0) {
						return new errors.InternalError(err.summary);
					} else {
						return new errors.InvalidContentError(err.invalidAttributes);
					}
			}
		}
	};

	return _.extend(errors, ormErrors);
};
