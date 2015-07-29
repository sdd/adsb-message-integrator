"use strict";
var proxyquire = require('proxyquire'),
    Promise    = require('bluebird'),
    chai       = require('chai'),
    sinon      = require('sinon'),
    expect     = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require("chai-as-promised"));

var _          = require('lodash');
var moment     = require('moment');
var validateMessageMock = sinon.stub();

var Integrator = proxyquire('../integrator', { './validate-message': validateMessageMock });

// pre-populated with required params
var templateMsg = {
	hex_ident       : 'ABCDEF',
	generated_date  : '',
	generated_time  : '',
	logged_date     : '',
	logged_time     : ''
};

describe('Integrator', function() {

	describe('getState', function() {

		it('should return a copy of the state', function() {

			var config     = { state: { some: 'thing' } };
			var integrator = Integrator(config);


			expect(integrator.getState() === config.state).to.equal(false);
		});

		it('should match initial state', function() {

			var config     = { state: { some: 'thing' } };
			var integrator = Integrator(config);

			expect(integrator.getState()).to.deep.equal({ some: 'thing' });

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
		it('should return success false when the submitted message is not valid', function() {
			validateMessageMock.returns(false);

			var integrator = Integrator({});

			var result = integrator.submitMessage({});

			expect(result.success).to.equal(false);
		});
	});

	describe('message integration', function() {

		var integrator;

		describe('untimely messages', function() {
			beforeEach(function() {
				validateMessageMock.returns(true);

				integrator = Integrator({
					maxMessageSkewPast_ms  : 1,
					maxMessageSkewFuture_ms: 1,
					time                   : moment('2015-07-27 01:00:00.000')
				});
			});

			it('should reject untimely late messages', function() {

				var result = integrator.submitMessage({
					hex_ident    : 'ABCDEF',
					receptionTime: moment('2015-07-27 01:00:00.002')
				});

				expect(result.success).to.equal(false);
			});

			it('should reject untimely early messages', function() {
				var result = integrator.submitMessage({
					hex_ident    : 'ABCDEF',
					receptionTime: moment('2015-07-27 00:59:59.998')
				});

				expect(result.success).to.equal(false);
			});
		});

		describe('integration of messages', function() {
			beforeEach(function() {
				validateMessageMock.returns(true);

				integrator = Integrator({
					maxMessageSkewPast_ms  : 100000000,
					maxMessageSkewFuture_ms: 100000000,
					time                   : moment('2015-07-27 01:00:00.000Z')
				});
			});

			it('should add a transponder to the state when a message is received for a particular transponder', function() {

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					receptionTime: moment('2015-07-27 01:00:00.000Z'),
					transmissionTime: moment('2015-07-27 01:00:00.000Z')
				}));

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : '56789',
					receptionTime: moment('2015-07-27 01:00:00.000Z'),
					transmissionTime: moment('2015-07-27 01:00:00.000Z')
				}));

				var result = integrator.getState();
				expect(result).to.have.all.keys(['ABCDEF', '56789']);
			});

			it('should update a state entry with updated data', function() {

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					aircraft_id  : 1000,
					receptionTime: moment('2015-07-27 01:00:00.000Z'),
					transmissionTime: moment('2015-07-27 01:00:00.000Z')
				}));

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					aircraft_id  : 2000,
					receptionTime: moment('2015-07-27 01:00:01.000Z'),
					transmissionTime: moment('2015-07-27 01:00:01.000Z')
				}));

				var result = integrator.getState();
				expect(result).to.have.all.keys(['ABCDEF']);
				expect(result['ABCDEF'].aircraft_id).to.equal(2000);
				expect(result['ABCDEF'].receptionTime.second()).to.equal(1);
			});

			it('should update a state entry with extra data', function() {

				integrator.reset();

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					altitude     : 1000,
					receptionTime: moment('2015-07-27 01:00:00.000'),
					transmissionTime: moment('2015-07-27 01:00:00.000')
				}));

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					track        : 180,
					receptionTime: moment('2015-07-27 01:00:02.000'),
					transmissionTime: moment('2015-07-27 01:00:02.000')
				}));

				var result = integrator.getState();
				expect(result).to.have.all.keys(['ABCDEF']);
				expect(result['ABCDEF'].altitude.value).to.equal(1000);
				expect(result['ABCDEF'].track.value).to.equal(180);
				expect(result['ABCDEF'].receptionTime.second()).to.equal(2);
			});

			it('should prune stale state data', function() {

				integrator.reset();

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					receptionTime: moment('2015-07-27 01:00:00.000Z'),
					transmissionTime: moment('2015-07-27 01:00:00.000Z')
				}));

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : '56789',
					receptionTime: moment('2015-07-27 01:01:01.000Z'),
					transmissionTime: moment('2015-07-27 01:01:01.000Z')
				}));

				integrator.updateState(moment('2015-07-27 01:01:01.000Z'));

				var result = integrator.getState();
				expect(result).to.have.all.keys(['56789']);
			});

			it('should correctly lerp data', function() {

				integrator.reset();

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					altitude     : 10000,
					receptionTime: moment('2015-07-27 01:00:00.000Z'),
					transmissionTime: moment('2015-07-27 01:00:00.000Z')
				}));

				integrator.submitMessage(_.extend(_.clone(templateMsg), {
					hex_ident    : 'ABCDEF',
					altitude     : 11000,
					receptionTime: moment('2015-07-27 01:00:10.000Z'),
					transmissionTime: moment('2015-07-27 01:00:10.000Z')
				}));

				integrator.updateState(moment('2015-07-27 01:00:20.000Z'));

				var result = integrator.getState();
				expect(result).to.have.all.keys(['ABCDEF']);
				expect(result['ABCDEF'].altitude.value).to.equal(12000);
			});
		});
	});
});
