var body = document.querySelector('body');
var port = chrome.runtime.connect({ name: "toolkit" });
var changeDelay = 300;
var changeTimeout;
var paused = true;
var inputX, inputY;
var altKeyWasPressed = false;
var connectionClosed = false;
// var lineColor = getLineColor();
var colorThreshold = [0.2,0.5,0.2];
var overlay = document.createElement('div');
overlay.className = 'toolkit__debug';
var debug;

function init() {
  window.addEventListener('mousemove', mouseMove);
  // window.addEventListener('touchmove', onInputMove);
  // window.addEventListener('scroll', onVisibleAreaChange);
  // window.addEventListener('resize', onResizeWindow);

  // window.addEventListener('keydown', detectAltKeyPress);
  // window.addEventListener('keyup', detectAltKeyRelease);

  // disableCursor();
  // requestNewScreenshot();
}

port.onMessage.addListener(function(request, sender, sendResponse){
  if (connectionClosed) {
    return;
  }

  console.log('received message');
  console.log('request :', request);
  console.log('sender :', sender);

  switch (request.type) {
    case 'init':
      console.log('init');
      debug = request.debug;
      init();
      break;
    case 'imageData':
      if (debug && request.imageData) {
        createDebugOverlay(request);
      }
      // resume();
      break;
    case 'debug screen':
      // renderDebugScreenshot(request.map)
      break;
    case 'destroy':
      // destroy();
      break;
  }
});

var canvas = document.createElement('canvas');
canvas.id = "toolkit__debug";
var context = canvas.getContext('2d');

function createDebugOverlay(request) {
  var img;
  img = new Image();
  img.src = request.imageData;
  img.onload = displayScreenshot.bind(img);

  canvas.width  = request.width;
  canvas.height = request.height;
}

function displayScreenshot() {
  context.drawImage(this, 0, 0, canvas.width, canvas.height);

  var overlay = document.getElementById("toolkit__debug");
  if (overlay) { overlay.parentNode.removeChild(overlay); }
  
  document.body.appendChild(canvas);
}


function mouseMove(event) {
  console.log('mousemove event');

  Xpos = event.clientX;
  Ypos = event.clientY;

  port.postMessage({
    type: 'mousePos',
    coord: { x: Xpos, y: Ypos }
  });
}