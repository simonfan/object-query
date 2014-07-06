
/* jshint ignore:start */

/* jshint ignore:end */

define('__object-query__/operators/match',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');

	/**
	 * @class operators
	 * @static
	 */

	/**
	 * Effectively does the matching against a single value
	 * @method $matchSingle
	 * @param expected {String|Number|RegExp}
	 *    String|Number: expected === value
	 *    RegExp: expected.match
	 * @param value {String|Number|Boolean}
	 *    Cannot be Array!
	 * @return {Boolean} True if matches, false if not.
	 */
	exports.$matchSingle = function $matchSingle(expected, value) {
		return _.isRegExp(expected) ? expected.test(value) : expected === value;
	};

	/**
	 * Verify if `value` supplied attends the `expected`.
	 * Behaves according to the type of `expected`. See {{#crossLink 'MongoQueryOperators/$matchSingle:method'}}{{/crossLink}}.
	 * If `value` is an array of values, returns true if ANY of the
	 * values attends the `expected`.
	 *
	 * @method $match
	 * @param expected {String|Number|RegExp}
	 * @param value {String|Number|Boolean|Array}
	 * @return {Boolean} True if matches, false if not.
	 */
	exports.$match = function $match(expected, value) {
		return _.isArray(value) ?
			_.any(value, function (v) {
				return exports.$matchSingle(expected, v);
			})
			:
			exports.$matchSingle(expected, value);
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__object-query__/operators/range',['require','exports','module'],function (require, exports, module) {
	

	/**
	 * Lesser than (<).
	 * @method $lt
	 * @param expected {Number|String}
	 * @param value {Number|String}
	 */
	exports.$lt = function $lt(expected, value) {
		return value < expected;
	};

	/**
	 * Lesser than or equal (<=).
	 * @method $lte
	 * @param expected {Number|String}
	 * @param value {Number|String}
	 */
	exports.$lte = function $lte(expected, value) {
		return value <= expected;
	};

	/**
	 * Greater than (>).
	 * @method $gt
	 * @param expected {Number|String}
	 * @param value {Number|String}
	 */
	exports.$gt = function $gt(expected, value) {
		return value > expected;
	};

	/**
	 * Greater than or equal (>=).
	 * @method $gte
	 * @param expected {Number|String}
	 * @param value {Number|String}
	 */
	exports.$gte = function $gte(expected, value) {
		return value >= expected;
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__object-query__/operators/set',['require','exports','module','lodash','containers'],function (require, exports, module) {
	

	var _ = require('lodash'),
		containers = require('containers');

	/**
	 * @method $in
	 * @param expected {Array}
	 * @param value {String|Number|Array}
	 *     Array: returns `true` if any of the values is in `expected`.
	 */
	exports.$in = function $in(expected, value) {
		return _.isArray(value) ?
			containers.containsAny(expected, value) : _.contains(expected, value);
	};

	/**
	 * @method $nin
	 * @param expected {Array}
	 * @param value {String|Number|Array}
	 *     Array: returns `true` if any of the values is not in `expected`.
	 */
	exports.$nin = function $nin(expected, value) {
		return _.isArray(value) ?
			!containers.containsAny(expected, value) : !_.contains(expected, value);
	};

	/**
	 * @method $all
	 * @param expected {Array}
	 * @param value {Array}
	 */
	exports.$all = function $all(expected, value) {
		return containers.containsAll(value, expected);
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__object-query__/operators/boolean',['require','exports','module'],function (require, exports, module) {
	

	/**
	 * @method $e
	 */
	exports.$e = function $e(expected, value) {

	};

	/**
	 * @method $ne
	 */
	exports.$ne = function $ne(expected, value) {
	//	return !$match(expected, value);
	};

	/**
	 * @method $not
	 */
	exports.$not = function $not() {};

	/**
	 * @method $or
	 */
	exports.$or = function $or() {};

	/**
	 * @method $and
	 */
	exports.$and = function $and() {};

	/**
	 * @method $exists
	 */
	exports.$exists = function $exists() {};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__object-query__/operators/index',['require','exports','module','lodash','deep','containers','./match','./range','./set','./boolean'],function (require, exports, module) {
	

	var _ = require('lodash'),
		deep = require('deep'),
		containers = require('containers');

	_.extend(
		exports,
		require('./match'),
		require('./range'),
		require('./set'),
		require('./boolean')
	);

	/**
	 * Evaluates a value against criterion
	 *
	 * @method evaluateValue
	 * @param value {Any}
	 * @param criterion {String|Number|RegExp|Object}
	 *     String|Number|RegExp : simple comparison
	 *     Object               : loop through multiple criteria.
	 */
	exports.evaluateValue = function evaluateValue(criterion, value) {

		if (_.isObject(criterion) && !_.isRegExp(criterion)) {
			// Criterion is actually a group of criteria
			// that should be applied simultaneously to
			// the value. All must be satisfied.
			return _.every(criterion, function (expected, operator) {

				var op = exports[operator];

				if (!op) {
					throw new Error('The operator ' + operator + ' is not supported by object-query.');
				} else {
					return op(expected, value);
				}
			});

		} else {
			// Criterion is a single criterion.
			return exports.$match(criterion, value);
		}
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__object-query__/match',['require','exports','module','lodash','deep','./operators/index'],function (require, exports, module) {
	

	var _ = require('lodash'),
		deep = require('deep'),
		operators = require('./operators/index');


	var numeral = /[0-9]+/;

	var matchAny = function matchAny(criterion, objects, keys) {
		return _.any(objects, function (obj) {
			return match(criterion, obj, keys);
		});
	};

	var match = module.exports = function match(criterion, object, keys) {
		var walker = deep.walker(object, keys);

		// initialize res to undefined value
		var res;

		while (walker.hasNext()) {

			var curr = walker.next();

			if (walker.hasNext()) {
				// still not at the end.

				if (_.isArray(curr) && !numeral.test(walker.nextStep())) {
					// if the current value is an array,
					// AND
					// the next key is NOT a number
					res = matchAny(criterion, curr, walker.remainingSteps());

					break;

				} else {

					// otherwise, just keep looping
					continue;
				}

			} else {
				// at the end
				res = operators.evaluateValue(criterion, curr);

				break;
			}
		}

		return res;
	};
});









/*

BEFORE deep.walker

	function match(criterion, object, keys) {

		// [1] parse keys
		keys = _.isArray(keys) ? keys : deep.parseKeys(keys);

		var lastKeyIndex = keys.length - 1;


		// [2] define a response object
		var res = false;

		// [3] define a var to hold current object (for walking)
		var curr = object;

		// [4] walk over object
		_.every(keys, function (key, index) {

			// get the current value
			curr = curr[key];

			// reached the end

			if (index === lastKeyIndex) {
				// set a response
				res = evaluateValue(criterion, curr);

				// and return false to break the loop
				return false;

			} else {

				// get next key
				var nextKey = keys[index + 1];

				if (_.isArray(curr) && !numberMatcher.test(nextKey)) {
					// if the current value is an array,
					// AND
					// the next key is NOT a number
					res = _.any(curr, function (obj) {
						return match(criterion, obj, _.rest(keys, index + 1));
					});

					// break loop
					return false;

				} else {
					// otherwise, just keep walking
					// keep loop
					return true;
				}
			}

		});

		return res;
	}
*/
;
/* jshint ignore:start */

/* jshint ignore:end */

define('__object-query__/find',['require','exports','module','lodash','deep','./operators/index'],function (require, exports, module) {
	

	var _ = require('lodash'),
		deep = require('deep'),
		operators = require('./operators/index');


	var numeral = /[0-9]+/;

	var matchAny = function matchAny(criterion, objects, keys) {
		return _.any(objects, function (obj) {
			return match(criterion, obj, keys);
		});
	};

	var match = module.exports = function match(criterion, object, keys) {
		var walker = deep.walker(object, keys);

		// initialize res to undefined value
		var res;

		while (walker.hasNext()) {

			var curr = walker.next();

			if (walker.hasNext()) {
				// still not at the end.

				if (_.isArray(curr) && !numeral.test(walker.nextStep())) {
					// if the current value is an array,
					// AND
					// the next key is NOT a number
					res = matchAny(criterion, curr, walker.remainingSteps());

					break;

				} else {
					// otherwise, just keep looping
					continue;
				}

			} else {
				// at the end
				res = operators.evaluateValue(criterion, curr);

				break;
			}
		}

		return res;
	};
});









/*

BEFORE deep.walker

	function match(criterion, object, keys) {

		// [1] parse keys
		keys = _.isArray(keys) ? keys : deep.parseKeys(keys);

		var lastKeyIndex = keys.length - 1;


		// [2] define a response object
		var res = false;

		// [3] define a var to hold current object (for walking)
		var curr = object;

		// [4] walk over object
		_.every(keys, function (key, index) {

			// get the current value
			curr = curr[key];

			// reached the end

			if (index === lastKeyIndex) {
				// set a response
				res = evaluateValue(criterion, curr);

				// and return false to break the loop
				return false;

			} else {

				// get next key
				var nextKey = keys[index + 1];

				if (_.isArray(curr) && !numberMatcher.test(nextKey)) {
					// if the current value is an array,
					// AND
					// the next key is NOT a number
					res = _.any(curr, function (obj) {
						return match(criterion, obj, _.rest(keys, index + 1));
					});

					// break loop
					return false;

				} else {
					// otherwise, just keep walking
					// keep loop
					return true;
				}
			}

		});

		return res;
	}
*/
;
//     ObjectMatcher
//     (c) simonfan
//     ObjectMatcher is licensed under the MIT terms.

/**
 * AMD and CJS module.
 *
 * @module ObjectMatcher
 */

/* jshint ignore:start */

/* jshint ignore:end */

define('object-query',['require','exports','module','lodash','./__object-query__/match','./__object-query__/find'],function (require, exports, module) {
	

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
