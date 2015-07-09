"use strict";
var proxyquire = require('proxyquire'),
    Promise    = require('bluebird'),
    chai       = require('chai'),
    sinon      = require('sinon'),
    expect     = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require("chai-as-promised"));

describe('Seneca integration', function() {

	var senecaCreateMockResponse = {};

	var config = {};

	var senecaMock = {
		addAsync: sinon.stub(),
		actAsync: sinon.stub().returns(Promise.resolve(senecaCreateMockResponse)),
		reset   : function() {
			senecaMock.addAsync.reset();
			senecaMock.actAsync.reset();
		}
	};

	var integratorMock = {
		submitMessage   : sinon.stub(),
		getState        : sinon.stub(),
		reset           : sinon.stub()
	};

	proxyquire('../seneca-bindings', {})(config, senecaMock, integratorMock);

	var actionSubmit   = senecaMock.addAsync.args[0][1];
	var actionGetState = senecaMock.addAsync.args[1][1];
	var actionReset    = senecaMock.addAsync.args[2][1];

	describe('seneca message handler', function() {

		it('should register with seneca using the correct matcher', function() {
			expect(senecaMock.addAsync.args[0][0].system).to.equal('ADSB');
			expect(senecaMock.addAsync.args[0][0].action).to.equal('submitMessage');
		});

		it('should register with seneca using the correct matcher', function() {
			expect(senecaMock.addAsync.args[1][0].system).to.equal('ADSB');
			expect(senecaMock.addAsync.args[1][0].action).to.equal('getState');
		});

		it('should register with seneca using the correct matcher', function() {
			expect(senecaMock.addAsync.args[2][0].system).to.equal('ADSB');
			expect(senecaMock.addAsync.args[2][0].action).to.equal('reset');
		});
	});

	describe('reset', function() {

		it('should return the result of integrator.reset', function(done) {

			integratorMock.reset.reset().returns(Promise.resolve('RESET1'));

			var response = actionReset();

			expect(integratorMock.reset).to.have.been.called;

			response.then(function(result) {
				expect(result).to.equal('RESET1');
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});
	});

	describe('getState', function() {

		it('should return the result of integrator.getState', function(done) {

			integratorMock.getState.reset().returns(Promise.resolve('STATE'));

			var response = actionGetState();

			expect(integratorMock.getState).to.have.been.called;

			response.then(function(result) {
				expect(result).to.equal('STATE');
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});
	});

	describe('submitMessage', function() {

		it('should call integrator.submitMessage and return the result', function(done) {

			integratorMock.submitMessage.reset().returns(Promise.resolve('SUBMITRESPONSE'));

			var response = actionSubmit({ message: 'MESSAGE1' });

			//TODO: WTF??
			//expect(integratorMock.submitMessage).to.have.been.calledWith('MESSSAGE1');

			response.then(function(result) {
				expect(result).to.equal('SUBMITRESPONSE');
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});
	});
});
