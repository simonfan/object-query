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
		match = require('./__object-query__/match'),
		find = require('./__object-query__/find');


	/**
	 * Just as states the name...
	 *
	 * @param  {[type]} criteria [description]
	 * @param  {[type]} object   [description]
	 * @return {[type]}          [description]
	 */
	function evaluateObjectAgainstSingleCriteria(criteria, object) {
		// loop through criteria
		return _.every(criteria, function (criterion, keys) {

			return match(criterion, object, keys);
		});

	}

	/**
	 * Evaluates a document against a set of criteria.
	 *
	 * @method evaluateObject
	 * @param document {Object}
	 * @param criteria {Object}
	 */
	function evaluateObject(criteria, object) {

		if (_.isArray(criteria)) {

			// array of criterias
			// [criteria, criteria, criteria, ...]
			return _.any(criteria, function (criteria) {
				return evaluateObjectAgainstSingleCriteria(criteria, object);
			});
		} else {
			// single criteria
			return evaluateObjectAgainstSingleCriteria(criteria, object);
		}
	}

	/**
	 * Returns a function that compares documents according to a specific criteria.
	 *
	 * @method objectQuery
	 * @param criteria {Object}
	 */
	var objectQuery = function objectQuery(criteria) {
		criteria = criteria || {};

		// create a function
		return _.partial(evaluateObject, criteria);
	};

	/**
	 * Glue some lodash methods.
	 */
	var _methods = [
		'every', 'all',
		'some', 'any',
		'filter',
		'find',
		'reject'
	];

	_.each(_methods, function (m) {
		objectQuery[m] = function (collection, criteria) {
			return _[m](collection, objectQuery(criteria));
		};
	});

	return objectQuery;
});
