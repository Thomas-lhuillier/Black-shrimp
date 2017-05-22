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
  'el': '',
  'color': '',
  'colorMode': 'hex',

  setColor: function(color) {
    color = typeof color !== 'undefined' ? color : this.color;
    this.color = color;

    switch (this.colorMode) {
      case 'hex':
        $('.colorPicker__hex').val(this.color.hex);
        break;
      case 'rgb':
        $('.colorPicker__r').val(this.color.r);
        $('.colorPicker__g').val(this.color.g);
        $('.colorPicker__b').val(this.color.b);
        break;
      case 'hsl':
        $('.colorPicker__h').val(this.color.h);
        $('.colorPicker__s').val(this.color.s);
        $('.colorPicker__l').val(this.color.l);
        break;
    }

    $('.colorPicker__color').css({
      'backgroundColor': 'rgb('+this.color.r+', '+this.color.g+', '+this.color.b+')'
    });
  },

  setColorMode: function(value) {
    $('.colorPicker__hexWrapper, .colorPicker__rgbWrapper, .colorPicker__hslWrapper').addClass('hidden');
    switch (value) {
      case 'hex':
        $('.colorPicker__hexWrapper').removeClass('hidden');
        break;
      case 'rgb':
        $('.colorPicker__rgbWrapper').removeClass('hidden');
        break;
      case 'hsl':
        $('.colorPicker__hslWrapper').removeClass('hidden');
        break;
    }

    this.colorMode = value;
    this.setColor();
  },

  construct: function() {
    var self = this;

    this.el = document.createElement('div');
    this.el.className = 'colorPicker';

    var html = '';
    html += '<div class="colorPicker__color"></div>';
    html += '<div class="colorPicker__valueWrapper">';

      html += '<div class="colorPicker__hexWrapper">';
        html += '<input type="text" class="colorPicker__hex">';
      html += '</div>';

      html += '<div class="colorPicker__rgbWrapper hidden">';
        html += '<input type="text" class="colorPicker__r">';
        html += '<input type="text" class="colorPicker__g">';
        html += '<input type="text" class="colorPicker__b">';
      html += '</div>';

      html += '<div class="colorPicker__hslWrapper hidden">';
        html += '<input type="text" class="colorPicker__h">';
        html += '<input type="text" class="colorPicker__s">';
        html += '<input type="text" class="colorPicker__l">';
      html += '</div>';

    html += '</div>';

    html += '<div class="colorPicker__colorType">colorType</div>';

    html += '<select class="colorPicker__colorSwitch" name="" id="">';
      html += '<option value="hex">hex</option>';
      html += '<option value="rgb">rgb</option>';
      html += '<option value="hsl">hsl</option>';
    html += '</select>';

    this.el.innerHTML = html;

    $(document).on('change', '.colorPicker__colorSwitch', function() {
      var value = $(this).val();
      self.setColorMode(value);
    });

    document.body.appendChild(this.el);
  },

  destroy: function() {
    this.el.parentNode.removeChild(this.el);
  },
}