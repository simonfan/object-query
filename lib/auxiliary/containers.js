function contains(arr, value) {
  return arr.indexOf(value) !== -1;
}

function containsAll(container, contained) {
  return contained.every(function (val) {
    return contains(container, val);
  });
}

function containsAny(container, contained) {
  return contained.some(function (val) {
    return contains(container, val);
  });
}

function exclusiveWithin(boundaries, item) {
  return boundaries[0] < item && item < boundaries[1];
}

function inclusiveWithin(boundaries, item) {
  return boundaries[0] <= item && item <= boundaries[1];
}

function within(boundaries, item, exclusive) {
  // determine which operator to use.
  var operator = exclusive ? exclusiveWithin : inclusiveWithin;

  // curry operator
  operator = function () {
    var args = Array.from(arguments);
    args.unshift(boundaries);

    return operator.apply(null, args);
  }

  return _.isArray(item) ? _.every(item, operator) : operator(item);
}

exports.contains = contains;
exports.containsAll = containsAll;
exports.containsAny = containsAny;
exports.exclusiveWithin = exclusiveWithin;
exports.inclusiveWithin = inclusiveWithin;
exports.within = within;
