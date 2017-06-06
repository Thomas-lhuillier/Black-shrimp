import Vue from 'vue';

import Vuex from 'vuex';
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isVisible: true,
    activeTab: 'color',
    color: {
      value: {
        hex: '',
        r: '',
        g: '',
        b: '',
        h: '',
        s: '',
        l: '',
      }
    },
    cursorOverlay: {
      isVisible: true,
      cursor: 'eyeDropper',
    },
    port: chrome.runtime.connect({ name: "toolkit" }),
  },
  getters: {
    getVisibilityState: state => state.isVisible,
    getActiveTab: state => state.activeTab,
    getColorState: state => state.color,
    getCursorVisibility: state => state.cursorOverlay.isVisible,
    getCursorType: state => state.cursorOverlay.cursor,
    getPort: state => state.port,
  },
  mutations: {
    setVisibility(state, val) {
      state.isVisible = val;
    },
    setActiveTab(state, val) {
      state.activeTab = val;
    },
    setColor(state, val) {
      // console.log('state', state);
      // console.log('val', val);
      state.color = val;
    },
  }
});

import MainComponent from './main.vue';

(function(){
  // constructUI();
})();

function constructUI() {
  var el = document.createElement('div');
  el.id = 'black-shrimp';
  el.className = 'blackShrimp';
  document.body.appendChild(el);

  app = new Vue({
    port,
    store, // inject store to all children
    el: '#black-shrimp',
    template: '<MainComponent/>',
    components: {
      MainComponent
    },
    methods: {
      setColor (val) {
        store.commit('setColor', val);
      },
    },
    mounted() {
      console.log('mounted');
    }
  });
};

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
  // window.addEventListener('mousemove', mouseMove);
  window.addEventListener('scroll', viewportChange);
  window.addEventListener('resize', viewportChange);

  ColorPicker.construct();

  // window.addEventListener('touchmove', onInputMove);

  // window.addEventListener('keydown', detectAltKeyPress);
  // window.addEventListener('keyup', detectAltKeyRelease);

  // disableCursor();
  // requestNewScreenshot();
}


/**
 * Dispatch messages
 */
port.onMessage.addListener(function(request, sender, sendResponse) {
  if (connectionClosed) { // @TODO
    return;
  }
  switch (request.type) {
    case 'init':
      console.log('init');
      debug = request.debug;
      init();
      break;
    case 'imageData':
      // Screenshot processed
      if (debug && request.imageData) {
        createDebugOverlay(request);
      }
      app.showUI();
      break;
    case 'color':
      // ColorPicker.setColor(request.data);
      app.setColor({ 'value': request.data });
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

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  // canvas.width  = request.width;
  // canvas.height = request.height;
  // canvas.setAttribute('width', window.innerWidth);
  // canvas.setAttribute('height', window.innerHeight);
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
function viewportChange(event) {
  var doc = document.documentElement;
  pageOffset.x = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  pageOffset.y = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

  app.hideUI();

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
 * Displays color indicators
 */
var app;
var ColorPicker = {
  'el': '',
  'color': '',
  'colorMode': 'hex',

  construct: function() {
    var el = document.createElement('div');
    el.id = 'black-shrimp';
    el.className = 'blackShrimp';
    document.body.appendChild(el);

    app = new Vue({
      store, // inject store to all children
      el: '#black-shrimp',
      template: '<MainComponent/>',
      components: {
        MainComponent
      },
      methods: {
        setColor (val) {
          store.commit('setColor', val);
        },
        hideUI() {
          store.commit('setVisibility', false);
        },
        showUI() {
          store.commit('setVisibility', true);
        },
      },
      mounted() {
        console.log('mounted');
      }
    });
  },

  destroy: function() {
    // @TODO
    // this.el.parentNode.removeChild(this.el);
  },
}
