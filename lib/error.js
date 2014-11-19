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
				case 'inspect':
					return new errors.InvalidContentError(error);
				case 'string':
					return new errors.InvalidContentError(error.toString());
				default: // json
					var err = error.toJSON();

					if(err.status === 500) {
						if(err.raw.name === 'MongoError') {
							if(err.raw.code ===  11000) {
								return new errors.InvalidContentError('Duplicate element');
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
