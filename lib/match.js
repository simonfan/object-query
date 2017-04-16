// third-party
const ObjectPathWalker = require('object-path-walker');

// own
const operators = require('./operators');

// constants
const NUMERAL_RE = /[0-9]+/;

var matchAny = function matchAny(criterion, objects, path) {
	return objects.some(function (obj) {
		return match(criterion, obj, path);
	});
};

var match = function match(criterion, object, path) {

	var walker = new ObjectPathWalker(object, path);

	// initialize res to undefined value
	var res;
	var current;

	while (walker.hasNext()) {

		walker.next();

		current = walker.currentValue();

		if (walker.hasNext()) {
			// still not at the end.
			
			if (current === undefined) {
				// if the current item is undefined and there are next
				// keys to be read, consider the target value to be undefined
				// and execute the comparison
				res = operators.evaluateValue(criterion, undefined);
				break;

			} else if (Array.isArray(current) && !NUMERAL_RE.test(walker.nextKey())) {
				// if the current value is an array,
				// AND
				// the next key is NOT a number
				// (thus does not refer to a specific item in the array)
				res = matchAny(criterion, current, walker.remainingPath());

				break;

			} else {

				// otherwise, just keep looping
				continue;
			}

		} else {
			// at the end
			res = operators.evaluateValue(criterion, current);

			break;
		}
	}

	return res;
};

module.exports = match;
