"use strict";
var proxyquire = require('proxyquire'),
    Promise    = require('bluebird'),
    chai       = require('chai'),
    sinon      = require('sinon'),
    expect     = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require("chai-as-promised"));

var Integrator = require('../integrator');

describe('Integrator', function() {

	describe('getState', function() {

		it('should return a copy of the state', function() {

			var config     = { state: { some: 'thing' } };
			var integrator = Integrator(config);

			expect(integrator.getState()).to.deep.equal({ some: 'thing' });
			expect(integrator.getState()).to.not.equal(config.state);

		});
	});

	describe('reset', function() {

		it('should reset the state to an empty object', function() {

			var config     = { state: { some: 'thing' } };
			var integrator = Integrator(config);

			integrator.reset();

			expect(integrator.getState()).to.deep.equal({});
		});
	});

	describe('submitMessage', function() {


	});

});
