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

  Magnifier.construct();

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
      break;
    case 'color':
      Magnifier.setColor(request.data);
      break;
    case 'debug screen':
      break;
    case 'destroy':
      // destroy();
      break;
  }
});

var canvas = document.createElement('canvas');
canvas.id = 'toolkit__debug';
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

  var overlay = document.getElementById('toolkit__debug');
  if (overlay) { overlay.parentNode.removeChild(overlay); }
  
  document.body.appendChild(canvas);
}

function mouseMove(event) {
  Xpos = event.clientX;
  Ypos = event.clientY;

  port.postMessage({
    type: 'mousePos',
    coord: { x: Xpos, y: Ypos }
  });
}

/**
 * Magnifier component
 * Displays a square color indicator
 */
var Magnifier = {
  color: '',
  el: '',
  setColor: function(color) {
    if (color.r) {
      this.color = color;
      this.el.style.backgroundColor = 'rgba('+this.color.r+', '+this.color.g+', '+this.color.b+', '+this.color.a+')';
    }
  },
  construct: function() {
    this.el = document.createElement('div');
    this.el.className = 'toolkit__magnifier';
    document.body.appendChild(this.el);
  },
  destroy: function() {
    this.el.parentNode.removeChild(this.el);
  },
}