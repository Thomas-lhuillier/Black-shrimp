import Vue from 'vue'
import Vuex from 'vuex'
import store from './vuex/store'
import appOverlay from './components/app-overlay.vue'
import appWindow from './components/app-window.vue'

Vue.use(Vuex)

window.onload = function () {
  // eslint-disable-next-line no-new
  new Vue({
    el: '#black-shrimp-root',

    components: {
      appWindow,
      appOverlay
    },

    // Inject store to all children
    store,

    render: (createElement) => {
      return createElement('div', {}, [
        createElement(appWindow),
        createElement(appOverlay)
      ])
    }
  })
}
