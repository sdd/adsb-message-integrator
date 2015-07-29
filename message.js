'use strict';
const _         = require('lodash'),
	moment      = require('moment'),
	stringHash  = require('string-hash');

var required_params = [
	'hex_ident',
	'generated_date',
	'generated_time',
	'logged_date',
	'logged_time'
];

module.exports = function Message(messageData) {

	if (!_.isPlainObject(messageData)) return false;

	// check all required params present
	if (_(messageData).pick(required_params).keys().value().length < required_params.length) {
		return false;
	}

	let message = _.omit(_.clone(messageData), _.isNull);

	message.receptionTime = message.receptionTime ||
		moment(
			message.logged_date + ' ' +
			message.logged_time,
			"YYYY/MM/DD HH:mm:ss.SSS"
		);

	message.transmissionTime = message.transmissionTime ||
		moment(
			message.generated_date + ' ' +
			message.generated_time,
			"YYYY/MM/DD HH:mm:ss.SSS"
		);

	message.hash = stringHash(
		_(message)
			.pick([
				'transmission_type', 'hex_ident', 'aircraft_id',
				'flight_id', 'callsign', 'altitude', 'ground_speed',
				'track', 'lat', 'lon', 'vertical_rate', 'squawk',
				'alert', 'emergency', 'spi', 'is_on_ground'
			])
			.omit(_.isUndefined)
			.values()
			.value()
			.join()
	);

	return message;
};
