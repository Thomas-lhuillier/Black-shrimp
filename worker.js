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
  console.log('x', x);
  console.log('y', y);
  var n = y * width * 4 + x * 4 ;
  var pixel = { r: tempArray[n], g: tempArray[++n], b: tempArray[++n], a: tempArray[++n] };
  return pixel;
}