'use strict';

var _ = require('lodash');

module.exports = function(config, seneca_instance, integrator) {
	var seneca = seneca_instance || require('seneca')();

	seneca.addAsync({ system: 'ADSB', action: 'submitMessage' }, function(args) {
		return integrator.submitMessage(args.message);
	});

	seneca.addAsync({ system: 'ADSB', action: 'getState' }, function() {
		return integrator.getState();
	});

	seneca.addAsync({ system: 'ADSB', action: 'reset' }, function() {
		return integrator.reset();
	});
};
