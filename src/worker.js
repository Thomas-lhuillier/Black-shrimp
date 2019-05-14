let imageData
let width
// eslint-disable-next-line no-unused-vars
let height

// In this file we can process the image data we received
// operating on a Uint8ClampedArray
// @todo Check for new type of shared array for workers

onmessage = function (event) {
  switch (event.data.type) {
    case 'imageData':
      imageData = new Uint8ClampedArray(event.data.imageData)

      width = event.data.width
      height = event.data.height
      break

    case 'getColor':
      getColor(event.data.coord)
      break
  }
}

function getColor (coord) {
  const { x, y } = coord
  const color = getPixelValueAt(x, y)

  postMessage({
    channel: 'app',
    data: {
      type: 'color',
      data: color
    }
  })
}

function getPixelValueAt (x, y) {
  const tempArray = new Uint8ClampedArray(imageData)
  let n = y * width * 4 + x * 4

  const R = tempArray[n]
  const G = tempArray[++n]
  const B = tempArray[++n]

  return { r: R, g: G, b: B }
}
