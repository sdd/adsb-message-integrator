'use strict';

var _ = require('lodash');

module.exports = function constructIntegrator(config) {

	var state = config.state || {};

	var integrateMessage = function(message) {

	};

	var isValidMessage = function(message) {
		return true;
	};

	return {
		submitMessage: function(message) {
			if (isValidMessage(message)) {
				return integrateMessage(message);
			} else {
				return {
					success: false,
					message: 'Invalid Message'
				}
			}
		},

		reset: function() {
			state = {};
		},

		getState: function() {
			return _.cloneDeep(state);
		}
	};
};
