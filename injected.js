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
  window.addEventListener('scroll', windowScroll);
  window.addEventListener('resize', windowResize);

  ColorPicker.construct();

  // window.addEventListener('touchmove', onInputMove);

  // window.addEventListener('keydown', detectAltKeyPress);
  // window.addEventListener('keyup', detectAltKeyRelease);

  // disableCursor();
  // requestNewScreenshot();
}

// Dispatch messages
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
      ColorPicker.setColor(request.data);
      break;
    case 'debug screen':
      break;
    case 'destroy':
      // destroy(); //@TODO
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

/**
 * Browser events
 */

var scrollPos = {};
function mouseMove(event) {
  scrollPos.x = event.clientX;
  scrollPos.y = event.clientY;

  port.postMessage({
    'type': 'mousePos',
    'coord': { 'x': scrollPos.x, 'y': scrollPos.y }
  });
}

var pageOffset = {};
function windowScroll(event) {
  var doc = document.documentElement;
  pageOffset.x = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  pageOffset.y = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

  port.postMessage({
    'type': 'viewportChange',
    'pageOffset': { 'x': pageOffset.x, 'y': pageOffset.y },
    // 'zoom' : '' //@TODO
  });
}

function windowResize(event) {

}

/**
 * Magnifier component
 * Displays a square color indicator
 */
var ColorPicker = {
  'color': '',
  'el': '',
  setColor: function(color) {
    if (color.r) {
      this.color = color;
      // this.el.style.backgroundColor = 'rgba('+this.color.r+', '+this.color.g+', '+this.color.b+', '+this.color.a+')';
      $('.colorPicker__color').css({
        'backgroundColor': 'rgba('+this.color.r+', '+this.color.g+', '+this.color.b+', '+this.color.a+')'
      });
    }
  },
  construct: function() {
    this.el = document.createElement('div');
    this.el.className = 'colorPicker';

    this.el.innerHTML = '';
    this.el.innerHTML += '<div class="colorPicker__color"></div>';
    this.el.innerHTML += '<div class="colorPicker__valueWrapper"><div class="colorPicker__rgba"><input type="text" class="colorPicker__r"><input type="text" class="colorPicker__g"><input type="text" class="colorPicker__b"><input type="text" class="colorPicker__a"></div></div>';
    this.el.innerHTML += '<div class="colorPicker__colorType">colorType</div>';
    this.el.innerHTML += '<select class="colorPicker__colorSwitch" name="" id=""><option value="hex">hex</option><option value="rgba">rgba</option><option value="hsla">hsla</option></select>';

    document.body.appendChild(this.el);
  },
  destroy: function() {
    this.el.parentNode.removeChild(this.el);
  },
}