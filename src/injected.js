import Vue from 'vue';
import Vuex from 'vuex';
import store from './vuex/store';
import Sortable from 'sortablejs';
import MainComponent from './main.vue';

/**
 * Dispatch Chrome port messages
 */
const port = store.getters.getPort;
port.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request :', request);

  switch (request.type) {
    case 'init':
      BlackShrimp.create();
      break;

    case 'imageData':
      app.showUI();
      break;

    case 'color':
      app.setColor({ value: request.data });
      break;

    case 'destroy':
      BlackShrimp.destroy();
      break;
  }
});

/**
 * Vue app
 */
Vue.use(Vuex).directive('sortable', {
  inserted: function(el, binding) {
    new Sortable(el, binding.value || {});
  }
});

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
      store, // Inject store to all children
      el: '#black-shrimp',
      template: '<MainComponent/>',

      components: {
        MainComponent
      },

      methods: {
        setColor(val) {
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
          const doc = document.documentElement;
          const pageOffset = {};
          pageOffset.x =
            (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
          pageOffset.y =
            (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
          port.postMessage({
            type: 'viewportChange',
            pageOffset: { x: pageOffset.x, y: pageOffset.y }
            // 'zoom' : '' // @todo
          });
        },
        onKeyPressed(event) {
          if (event.keyCode == 27) {
            // ESC key pressed
            port.postMessage({
              type: 'destroy'
            });
          }
        },
        destroy() {
          this.$destroy();
        }
      },

      beforeCreate() {
        // Dynamically insert the root element in the body
        const el = document.createElement('div');
        el.id = 'black-shrimp';
        document.body.appendChild(el);
      },

      mounted() {
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
        const el = document.getElementById('black-shrimp');
        el.parentNode.removeChild(el);
      }
    });
  },

  destroy: function() {
    // @todo
    app.destroy();
  }
};

/**
 * Tools
 * @todo import from separated file
 */

Number.prototype.between = function(a, b, inclusive) {
  const min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
  return inclusive ? this >= min && this <= max : this > min && this < max;
};
