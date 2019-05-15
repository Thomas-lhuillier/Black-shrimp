import Vue from 'vue'
import Vuex from 'vuex'
import store from './vuex/store'
import VTooltip from 'v-tooltip'
import appOverlay from './components/app-overlay.vue'
import appWindow from './components/app-window.vue'
import './sass/main.scss'

Vue
  .use(Vuex)
  .use(VTooltip)

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

    destroyed () {
      store.dispatch('destroy')
    },

    mounted () {
      window.addEventListener('keydown', this.onKeyDown)
    },

    beforeDestroy () {
      window.removeEventListener('keydown', this.onKeyDown)
    },

    methods: {
      onKeyDown: (e) => {
        if (e.key === 'Escape') {
          store.dispatch('destroy')
        }
      }
    },

    render: (createElement) => {
      return createElement('div', {}, [
        createElement(appWindow),
        createElement(appOverlay)
      ])
    }
  })
}
