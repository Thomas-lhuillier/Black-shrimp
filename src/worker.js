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

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // return [h, s, l];
  return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}
