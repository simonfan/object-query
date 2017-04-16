/**
 * Assign all operators onto the main exports.
 */

Object.assign(
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

	if (typeof criterion === 'object' && !(criterion instanceof RegExp)) {

		// Criterion is actually a group of criteria
		// that should be applied simultaneously to
		// the value. All must be satisfied.
		return Object.keys(criterion).every(function (operator) {
			var expected = criterion[operator];
			var opFn = exports[operator];

			if (!opFn) {
				throw new Error('The operator ' + operator + ' is not supported by object-query.');
			} else {
				return opFn(expected, value);
			}
		});

	} else {
		// Criterion is a single criterion.
		return exports.$match(criterion, value);
	}
};
