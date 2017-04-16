//     ObjectQuery
//     (c) simonfan
//     ObjectQuery is licensed under the MIT terms.

// own
const match = require('./match');

/**
 * @param  {Object} criteria
 * @param  {Object} object
 * @return {Boolean}
 */
function evaluateObjectAgainstSingleCriteria(criteria, object) {
  // loop through criteria
  return Object.keys(criteria).every(function (path) {
    return match(criteria[path], object, path);
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

  if (Array.isArray(criteria)) {

    // array of criterias
    // [criteria, criteria, criteria, ...]
    return criteria.some(function (criteria) {
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
  return function () {
    var args = Array.from(arguments);
    args.unshift(criteria);

    return evaluateObject.apply(null, args);
  };
};

module.exports = objectQuery;
