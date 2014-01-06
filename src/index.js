//     ObjectMatcher
//     (c) simonfan
//     ObjectMatcher is licensed under the MIT terms.

/**
 * AMD and CJS module.
 *
 * @module ObjectMatcher
 */

/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash'),
		match = require('./object-query-sub/match'),
		find = require('./object-query-sub/find');

	/**
	 * Evaluates a document against a set of criteria.
	 *
	 * @method evaluateObject
	 * @param document {Object}
	 * @param criteria {Object}
	 */
	function evaluateObject(criteria, object) {
		// loop through criteria
		return _.every(criteria, function (criterion, keys) {

			return match(criterion, object, keys);
		});
	}

	/**
	 * Returns a function that compares documents according to a specific criteria.
	 *
	 * @method objectMatcher
	 * @param criteria {Object}
	 */
	var objectMatcher = function objectMatcher(criteria) {
		criteria = criteria || {};

		// create a function
		var func = _.partial(evaluateObject, criteria);

		func.filter = function filter(arr) {
			_.filter(arr, func);
		};

		return func;
	};

	objectMatcher.find = function find(collection, criteria) {
		return _.find(collection, objectMatcher(criteria));
	};

	objectMatcher.filter = function filter(collection, criteria) {
		return _.filter(collection, objectMatcher(criteria));
	};

	return objectMatcher;
});
