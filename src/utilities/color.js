/**
 * Convert RGB to HSL
 *
 * @param {number} r Red value
 * @param {number} g Green value
 * @param {number} b Blue value
 *
 * @returns {number[]} [h, s, l] The HSL color
 */
function rgbToHsl (rgb) {
  let { r, g, b } = rgb
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s
  let l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break

      case g:
        h = (b - r) / d + 2
        break

      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  h = Math.floor(h * 360)
  s = Math.floor(s * 100)
  l = Math.floor(l * 100)

  return { h, s, l }
}

/**
 * Convert RGB to Hexadecimal
 *
 * @param {number} r Red value
 * @param {number} g Green value
 * @param {number} b Blue value
 *
 * @returns {string} The hexadecimal color
 */
function rgbToHex (rgb) {
  const { r, g, b } = rgb
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

/**
 * Convert RGB color component to hexadecimal
 *
 * @param {number} c The RGB color component (R, G or B)
 *
 * @returns {string} A two character string representing the hexadecimal value of RGB color component
 */
function componentToHex (c) {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

export { rgbToHsl, rgbToHex }
