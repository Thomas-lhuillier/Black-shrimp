import Vue from 'vue';
import Vuex from 'vuex';
import Sortable from 'sortablejs'

Vue.use(Vuex);

Vue.directive('sortable', {
  inserted: function (el, binding) {
    new Sortable(el, binding.value || {})
  }
});

import MainComponent from './main.vue';


/**
 * Store
 *
 * Contains the state of the application,
 * to be shared with application components.
 */
const store = new Vuex.Store({
  state: {
    isVisible: true,
    isMoving: false,
    activeTab: 'color',
    color: {
      value: {
        hex : '',
        r   : '',
        g   : '',
        b   : '',
        h   : '',
        s   : '',
        l   : '',
      }
    },
    colors: [],
    colors2: [{id: 1}, {id: 2}, {id: 3}],
    cursorOverlay: {
      isVisible: true,
      cursor: 'eyeDropper',
    },
    port: chrome.runtime.connect({ name: "toolkit" }), // @TODO change to black shrimp
  },

  getters: {
    getVisibility       : state => state.isVisible,
    getMovingStatus     : state => state.isMoving,
    getActiveTab        : state => state.activeTab,
    getColorState       : state => state.color,
    getCursorVisibility : state => state.cursorOverlay.isVisible,
    getCursorType       : state => state.cursorOverlay.cursor,
    getPort             : state => state.port,
    getColors           : state => state.colors,
    getColors2          : state => state.colors2,
  },

  mutations: {
    setVisibility(state, val) {
      state.isVisible = val;
    },
    setActiveTab(state, val) {
      state.activeTab = val;
    },
    setColor(state, val) {
      console.log('VALUE:', val.value);
      state.color.value = val.value;
    },
    setMovingStatus(state, val) {
      state.isMoving = val;
    },
    setHex(state, val) {
      state.color.value.hex = val;
    },
    setColors(state, arr) {
      state.colors = arr;
      // Save colors in chrome storage.
      chrome.storage.sync.set({'colors': arr}, function() {});
    },
    setColors2(state, arr) {
      state.colors2 = arr;
    },
  }

});


/**
 * Dispatch Chrome port messages
 */
var debug;
var connectionClosed = false;
var port = store.getters.getPort;

port.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request :', request);
  if (connectionClosed) { return; } // @TODO

  switch (request.type) {
    case 'init':
      console.log('request init');
      debug = request.debug;
      BlackShrimp.create();
      break;
    case 'imageData':
      console.log('request imageData');
      // Screenshot processed
      // if (debug && request.imageData) {
      //   createDebugOverlay(request);
      // }
      app.showUI();
      break;
    case 'color':
      console.log('request color');
      app.setColor({ 'value': request.data });
      break;
    case 'destroy':
      BlackShrimp.destroy();
      break;
  }
});


/**
 * Display debug screen
 */
var canvas = document.createElement('canvas');
canvas.id = 'toolkit__debug';
var context = canvas.getContext('2d');

function createDebugOverlay(request) {
  var img;
  img        = new Image();
  img.src    = request.imageData;
  img.onload = displayScreenshot.bind(img);

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function displayScreenshot() {
  context.drawImage(this, 0, 0, canvas.width, canvas.height);

  var overlay = document.getElementById('toolkit__debug');
  if (overlay) { overlay.parentNode.removeChild(overlay); }

  document.body.appendChild(canvas);
}


/**
 * Vue app
 */
// var changeDelay = 300;
// var changeTimeout;
// var paused = true;
// var altKeyWasPressed = false;
// var colorThreshold = [0.2,0.5,0.2];
let overlay = document.createElement('div');
overlay.className = 'toolkit__debug';

let app;
let scrollTimer;
let BlackShrimp = {
  create: function() {
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
        delayScroll(event) {
          app.hideUI();

          let self = this;
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function() {
            self.onViewportChange(event);
          }, 50);
        },
        onViewportChange(event) {
          console.log('process viewport change');
          var doc = document.documentElement;
          var pageOffset = {};
          pageOffset.x = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
          pageOffset.y = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
          port.postMessage({
            'type': 'viewportChange',
            'pageOffset': { 'x': pageOffset.x, 'y': pageOffset.y },
            // 'zoom' : '' //@TODO
          });
        },
        onKeyPressed(event) {
          if (event.keyCode == 27) { // ESC pressed
            port.postMessage({
              'type': 'destroy'
            });
          }
        },
        destroy() {
          console.log('destroy app.$destroy');
          this.$destroy();
        },
      },
      beforeCreate() {
        var el = document.createElement('div');
        el.id = 'black-shrimp';
        document.body.appendChild(el);
      },
      mounted() {
        console.log('app mounted');
        window.addEventListener('scroll', this.delayScroll);
        window.addEventListener('resize', this.onViewportChange);
        window.addEventListener('keyup', this.onKeyPressed);
      },
      beforeDestroy() {
        window.removeEventListener('scroll', this.delayScroll);
        window.removeEventListener('resize', this.onViewportChange);
        window.removeEventListener('keyup', this.onKeyPressed);
      },
      destroyed() {
        console.log('app destroyed');
        var el = document.getElementById('black-shrimp');
        el.parentNode.removeChild(el);
      }
    });
  },

  destroy: function() {
    // @TODO
    app.destroy();
  },
}
