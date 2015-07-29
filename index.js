'use strict';

const Integrator = require('./integrator');

module.exports = function(config, seneca_instance) {

	const seneca = seneca_instance || require('seneca');
	const integrator = Integrator(config.adsb || {});

	require('./seneca-bindings')(config, seneca, integrator);

	return {
		koa: () => require('./koa-routes')(seneca)
	};
};

module.exports.koa = seneca => require('./koa-routes')(seneca);
