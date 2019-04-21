export { between };

const between = function(x, a, b, inclusive = true) {
  var min = Math.min(a, b),
    max = Math.max(a, b);

  return inclusive ? x >= min && x <= max : x > min && x < max;
};
