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
		add     : sinon.stub(),
		actAsync: sinon.stub().returns(Promise.resolve(senecaCreateMockResponse)),
		reset   : function() {
			senecaMock.add.reset();
			senecaMock.actAsync.reset();
		}
	};

	var integratorMock = {
		submitMessage   : sinon.stub(),
		getState        : sinon.stub(),
		reset           : sinon.stub()
	};

	proxyquire('../seneca-bindings', {})(config, senecaMock, integratorMock);

	var actionSubmit   = senecaMock.add.args[0][1];
	var actionGetState = senecaMock.add.args[1][1];
	var actionReset    = senecaMock.add.args[2][1];

	describe('seneca message handler', function() {

		it('should register with seneca using the correct matcher', function() {
			expect(senecaMock.add.args[0][0].system).to.equal('ADSB');
			expect(senecaMock.add.args[0][0].action).to.equal('submitMessage');
		});

		it('should register with seneca using the correct matcher', function() {
			expect(senecaMock.add.args[1][0].system).to.equal('ADSB');
			expect(senecaMock.add.args[1][0].action).to.equal('getState');
		});

		it('should register with seneca using the correct matcher', function() {
			expect(senecaMock.add.args[2][0].system).to.equal('ADSB');
			expect(senecaMock.add.args[2][0].action).to.equal('reset');
		});
	});

	describe('reset', function() {

		it('should return the result of integrator.reset', function(done) {

			integratorMock.reset.reset().returns('RESET1');

			actionReset(null, function(err, result) {
				expect(integratorMock.reset).to.have.been.called;

				expect(result).to.equal('RESET1');
				expect(err).to.equal(null);
				done(err);
			});
		});
	});

	describe('getState', function() {

		it('should return the result of integrator.getState', function(done) {

			integratorMock.getState.reset().returns('STATE');

			actionGetState(null, function(err, result) {
				expect(integratorMock.getState).to.have.been.called;
				expect(result).to.equal('STATE');
				expect(err).to.equal(null);
				done(err);
			});
		});
	});

	describe('submitMessage', function() {

		it('should call integrator.submitMessage and return the result', function(done) {

			integratorMock.submitMessage.reset().returns('SUBMITRESPONSE');

			actionSubmit({ message: 'MESSAGE1' }, function(err, result) {
				//expect(integratorMock.submitMessage).to.have.been.calledWith('MESSSAGE1');
				expect(result).to.equal('SUBMITRESPONSE');
				expect(err).to.equal(null);
				done(err);
			});
		});
	});
});
