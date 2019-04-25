const between = function (x, a, b, inclusive = true) {
  const min = Math.min(a, b)
  const max = Math.max(a, b)

  return inclusive ? x >= min && x <= max : x > min && x < max
}

export { between }
