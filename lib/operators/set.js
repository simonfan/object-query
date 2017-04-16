// third-party
const containers = require('../auxiliary/containers');

/**
 * @method $in
 * @param expected {Array}
 * @param value {String|Number|Array}
 *     Array: returns `true` if any of the values is in `expected`.
 */
exports.$in = function $in(expected, value) {
	return Array.isArray(value) ?
		containers.containsAny(expected, value) : containers.contains(expected, value);
};

/**
 * @method $nin
 * @param expected {Array}
 * @param value {String|Number|Array}
 *     Array: returns `true` if any of the values is not in `expected`.
 */
exports.$nin = function $nin(expected, value) {
	return Array.isArray(value) ?
		!containers.containsAny(expected, value) : !containers.contains(expected, value);
};

/**
 * @method $all
 * @param expected {Array}
 * @param value {Array}
 */
exports.$all = function $all(expected, value) {
	return containers.containsAll(value, expected);
};
