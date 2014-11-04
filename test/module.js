'use strict';

var elefrant = require('../index'),
	should = require('should');


describe('elefrantio', function () {

	it('exports an object', function () {
		should.exist(elefrant);
		/*jshint -W030 */ should(elefrant).be.an.Object;
	});
});
