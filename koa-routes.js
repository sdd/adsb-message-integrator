'use strict';
const _      = require('lodash'),
      router = require('koa-router')();

const defaults = {
    adsb: {
        submit: '/message',
	    getState: '/state'
    }
};

module.exports = function(seneca_instance, options) {
	const seneca = seneca_instance || require('seneca')();

	options = _.extend(defaults, options);

	router.post(options.adsb.submit, function* post_adsb_submitMessage() {
		let args   = {
			system  : 'ADSB',
			action  : 'submitMessage',
			message : this.request.body
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

	router.get(options.adsb.getState, function* get_adsb_state() {
		let args   = {
			system : 'ADSB',
			action : 'getState'
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

	return router.middleware();
};
