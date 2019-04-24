import { rgbToHsl, rgbToHex } from './utilities/color';

let imageData;
let workerImageData;
let width, height;

// In this file we can process the image data we received
// operating on a Uint8ClampedArray

onmessage = function(event) {
  switch (event.data.type) {
    case 'init':
      break;

    case 'imageData':
      imageData = new Uint8ClampedArray(event.data.imageData);
      workerImageData = new Uint8ClampedArray(imageData);

      width = event.data.width;
      height = event.data.height;

      postMessage(
        {
          type: 'screenshot processed',
          imageData: imageData.buffer,
          width: width,
          height: height
        },
        [imageData.buffer]
      );
      break;

    case 'mousePos':
      let coord = event.data.coord;
      processMousePos(coord);
      break;
  }
};

let centerPixel = {};

function processMousePos(coord) {
  centerPixel.x = coord.x;
  centerPixel.y = coord.y;
  Object.assign(centerPixel, getPixelValueAt(centerPixel.x, centerPixel.y));

  postMessage({
    type: 'color',
    data: centerPixel
  });
}

function getPixelValueAt(x, y) {
  let tempArray = new Uint8ClampedArray(workerImageData);
  let n = y * width * 4 + x * 4;

  let R = tempArray[n],
    G = tempArray[++n],
    B = tempArray[++n],
    HEX = rgbToHex(R, G, B),
    HSL = rgbToHsl(R, G, B);

  let pixel = { r: R, g: G, b: B, hex: HEX, h: HSL[0], s: HSL[1], l: HSL[2] };
  return pixel;
}
