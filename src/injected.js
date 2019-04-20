import Vue from 'vue';
import Vuex from 'vuex';
import store from './vuex/store';
import Sortable from 'sortablejs';
import IframeComponent from './components/iframe.vue';
import OverlayComponent from './components/overlay.vue';
import PanelComponent from './components/panel.vue';

// Dispatch Chrome port messages
const port = store.getters.getPort;
port.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case 'init':
      BlackShrimp.create();
      break;

    case 'imageData':
      appInstance.showUI();
      break;

    case 'color':
      appInstance.setColor({ value: request.data });
      break;

    case 'destroy':
      BlackShrimp.destroy();
      break;
  }
});

// Vue app
Vue.use(Vuex).directive('sortable', {
  inserted: function(el, binding) {
    new Sortable(el, binding.value || {});
  }
});

let appInstance;
let scrollTimer;

let BlackShrimp = {
  create: function() {
    appInstance = new Vue({
      el: '#black-shrimp-root',

      template: `
        <IframeComponent>
          <PanelComponent/>
          <OverlayComponent/>
        </IframeComponent>`,

      // Inject store to all children
      store,

      components: {
        IframeComponent,
        PanelComponent,
        OverlayComponent
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

        handleViewportChange(event) {
          appInstance.hideUI();

          let self = this;
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function() {
            self.processViewportChange(event);
          }, 50);
        },

        processViewportChange(event) {
          const doc = document.documentElement;
          const pageOffset = {};

          pageOffset.x =
            (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
          pageOffset.y =
            (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

          port.postMessage({
            type: 'viewportChange',
            pageOffset: { x: pageOffset.x, y: pageOffset.y }
          });
        },

        destroy() {
          this.$destroy();
        }
      },

      beforeCreate() {
        // Dynamically insert the root element in the body
        const el = document.createElement('div');
        el.id = 'black-shrimp-root';
        document.body.appendChild(el);
      },

      mounted() {
        window.addEventListener('scroll', this.handleViewportChange);
        window.addEventListener('resize', this.handleViewportChange);
      },

      beforeDestroy() {
        window.removeEventListener('scroll', this.handleViewportChange);
        window.removeEventListener('resize', this.handleViewportChange);
      },

      destroyed() {
        // Manually remove the root element, since Vue let the DOM untouched on destroy
        this.$el.parentNode.removeChild(this.$el);
      }
    });
  },

  destroy: function() {
    appInstance.$destroy();
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
