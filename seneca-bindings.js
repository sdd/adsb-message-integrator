'use strict';

module.exports = function(config, seneca_instance, integrator) {
	var seneca = seneca_instance || require('seneca')();

	seneca.add({ system: 'ADSB', action: 'submitMessage' }, function(args, done) {
		done(null, integrator.submitMessage(args.message));
	});

	seneca.add({ system: 'ADSB', action: 'getState' }, function(args, done) {
		done(null, integrator.getState());
	});

	seneca.add({ system: 'ADSB', action: 'reset' }, function(args, done) {
		done(null, integrator.reset());
	});
};
