'use strict';

var orm = require('../index'),
	should = require('should');


describe('orm', function () {

	it('exports an object', function () {
		should.exist(orm);
	});

	describe('errors', function () {
		it('empty collections and connections', function () {
			var options = {};
			options.adapters = options.connections = options.collections = {};
			orm(options, function (err, models) {
				models.collections.should.be.empty;
				models.connections.should.be.empty;
			});
		});
	});

	describe('models', function () {
		it('get collections and connections', function () {
			var options = {
				adapters: {
					'sails-disk': require('sails-disk')
				},
				connections: {
					localDiskDb: {
						adapter: 'sails-disk'
					},
				},
				collections: {
					Help: {
						migrate: 'safe',
						connection: 'localDiskDb',
						attributes: {
							provider: {
								type: 'alphanumericdashed'
							},
							identifier: {
								type: 'string'
							}
						}
					}
				}
			};
			orm(options, function (err, models) {
				models.collections.should.not.be.empty;
				models.connections.should.not.be.empty;
			});
		});
	});
});
