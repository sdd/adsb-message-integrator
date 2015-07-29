"use strict";
var proxyquire = require('proxyquire'),
    chai       = require('chai'),
    sinon      = require('sinon'),
    expect     = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require("chai-as-promised"));

var moment = require('moment');

var Message = proxyquire('../message', {});

describe('Message', function() {

	it('should return false if the passed in message data is not POJO', function() {

		var msg = Message();
		expect(msg).to.equal(false);

		msg = Message(null);
		expect(msg).to.equal(false);
	});

	it('should return false if there are reqd params missing', function() {
		var msg = Message({
			'transmission_type': 3
		});
		expect(msg).to.equal(false);
	});

	it('should return a message if all reqd params present', function() {
		var msg = Message({
			'transmission_type': 3,
			'hex_ident': 'ABCDEF',
			generated_date: '',
			generated_time: '',
			logged_date   : '',
			logged_time   : ''
		});
		expect(msg).to.not.equal(false);
	});
});
