var debug;

var imageData;

// In this file we can process the image data we received
// operating on a Uint8ClampedArray

onmessage = function(event){
  switch (event.data.type) {
    case 'init':
      debug = event.data.debug;
      // postMessage({ type: "init", debug: debug});
      break;
    case 'imageData':
      imageData = new Uint8ClampedArray(event.data.imageData);
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

function processMousePos(coord) {
  console.log('worker received coordinates:', coord);
}