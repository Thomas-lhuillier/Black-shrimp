var debug;
var imageData;
var workerImageData;

// In this file we can process the image data we received
// operating on a Uint8ClampedArray

onmessage = function(event) {
  switch (event.data.type) {
    case 'init':
      debug = event.data.debug;
      // postMessage({ type: "init", debug: debug});
      break;

    case 'imageData':
      imageData = new Uint8ClampedArray(event.data.imageData);
      workerImageData = new Uint8ClampedArray(imageData);
      // data = grayscale( imageData );

      width = event.data.width;
      height = event.data.height;

      postMessage({
        type: 'screenshot processed',
        imageData: imageData.buffer,
        width: width,
        height: height
      }, [imageData.buffer]);
      break;

    case 'mousePos':
      var coord = event.data.coord
      processMousePos(coord);
      break;
  }
}

var centerPixel = {};

function processMousePos(coord) {
  centerPixel.x = coord.x;
  centerPixel.y = coord.y;
  Object.assign(centerPixel, getPixelValueAt(centerPixel.x, centerPixel.y));
  console.log('centerPixel', centerPixel);

  postMessage({
    type: 'color',
    data: centerPixel
  });
}

function getPixelValueAt(x, y) {
  var tempArray = new Uint8ClampedArray(workerImageData);
  var n = y * width * 4 + x * 4 ;

  var R = tempArray[n],
      G = tempArray[++n]
      B = tempArray[++n],
      HEX = rgbToHex(R, G, B),
      HSL = rgbToHsl(R, G, B);

  var pixel = { r: R, g: G, b: B, hex: HEX, h: HSL[0], s: HSL[1], l: HSL[2] };
  return pixel;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHsl(r, g, b) {
  var min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      diff = max - min,
      h = 0, s = 0, l = (min + max) / 2;

  if (diff != 0) {
    s = l < 0.5 ? diff / (max + min) : diff / (2 - max - min);
    h = (r == max ? (g - b) / diff : g == max ? 2 + (b - r) / diff : 4 + (r - g) / diff) * 60;
  }

  return [h, s, l];
}
