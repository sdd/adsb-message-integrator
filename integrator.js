'use strict';

const _              = require('lodash'),
      moment         = require('moment'),
      Message        = require('./message');

module.exports = function constructIntegrator(settings) {

	const defaults = {
		maxMessageSkewFuture_ms: 1000,
		maxMessageSkewPast_ms  : 1000,
		staleDiscardTime_s     : 60
	};

	const config = _.extend(defaults, settings);

	const lerpParams = [
		'altitude', 'ground_speed', 'track',
		'lat', 'lon', 'vertical_rate'
	];

	const staticParams = [
		'session_id', 'aircraft_id', 'flight_id', 'callsign',
		'squawk', 'alert', 'emergency', 'spi', 'is_on_ground',
	    'receptionTime', 'transmissionTime'
	];

	let state = config.state ? _.cloneDeep(config.state) : {};

	const isUntimely = function(message) {
		let now = config.time || moment();

		if (message.receptionTime.isBetween(
				now.clone().subtract(config.maxMessageSkewPast_ms, 'ms'),
				now.clone().add(config.maxMessageSkewFuture_ms, 'ms')
			)) {
			return false;
		} else {
			return message.receptionTime.diff(now);
		}
	};

	const integrateLerpParam = function(oldState, time, value, key) {
		let res = {
			value      : value,
			lastUpdated: time.clone(),
			deltaPerMs: 0
		};

		if (!_.isUndefined(oldState[key])) {
			res.deltaPerMs = (value - oldState[key].value) /
				time.clone().diff(oldState[key].lastUpdated);
		}

		return res;
	};

	const integrateMessage = function(message) {
		let untimely = isUntimely(message);
		if (untimely) {
			return {
				success: false,
				message: `Message untimely. Skew: ${untimely}ms`
			}
		}

		if (!state[message.hex_ident]) {
			state[message.hex_ident] = {}
		}

		_.extend(
			state[message.hex_ident],
			_(message).pick(staticParams).value(),
			_(message).pick(lerpParams)
				.mapValues(
					_.curry(integrateLerpParam)
						(state[message.hex_ident])
						(message.transmissionTime)
				).value()
		);

		return { success: true };
	};

	const pruneState = function(time) {
		state = _.omit(state, entry =>
			entry.receptionTime.isBefore(
				time.clone().subtract(config.staleDiscardTime_s, 's')
			)
		);
	};

	const updateLerps = function(time) {

		let doLerp = val => ({
			value: val.value + val.deltaPerMs * time.diff(val.lastUpdated, 'ms'),
			deltaPerMs: val.deltaPerMs,
			lastUpdated: time
		});

		let lerpStateEntry = entry => _.extend(entry,
			_(entry)
				.pick(lerpParams)
				.mapValues(doLerp)
				.value()
		);

		state = _.mapValues(state, lerpStateEntry);
	};

	return {
		submitMessage: function(messageData) {
			let message = Message(messageData);
			if (message) {
				return integrateMessage(message);
			} else {
				return {
					success: false,
					message: 'Invalid Message'
				};
			}
		},

		reset: function() {
			state = {};
		},

		getState: function() {
			return _.cloneDeep(state, node =>
				node && !_.isUndefined(node.lastUpdated) ? node.value : node
			);
		},

		updateState: function(time) {
			time = time || moment();
			pruneState(time);
			updateLerps(time);
		}
	};
};
