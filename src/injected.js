import Vue from 'vue'
import Vuex from 'vuex'
import store from './vuex/store'
import IframeComponent from './components/iframe.vue'
import OverlayComponent from './components/overlay.vue'
import PanelComponent from './components/panel.vue'

Vue.use(Vuex)

// Dispatch Chrome port messages
const port = store.getters.getPort
let app

port.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case 'init':
      app = createApp()
      break

    case 'imageData':
      app.showUI()
      break

    case 'color':
      app.setColor(request.data)
      break

    case 'destroy':
      app.$destroy()
      break
  }
})

let scrollTimer

const createApp = () => {
  return new Vue({
    el: '#black-shrimp-root',

    components: {
      IframeComponent,
      PanelComponent,
      OverlayComponent
    },

    // Inject store to all children
    store,

    beforeCreate () {
      // Dynamically insert the root element in the body
      const el = document.createElement('div')
      el.id = 'black-shrimp-root'
      document.body.appendChild(el)
    },

    mounted () {
      window.addEventListener('scroll', this.handleViewportChange)
      window.addEventListener('resize', this.handleViewportChange)
    },

    beforeDestroy () {
      window.removeEventListener('scroll', this.handleViewportChange)
      window.removeEventListener('resize', this.handleViewportChange)
    },

    destroyed () {
      // Manually remove the root element, since Vue let the DOM untouched on destroy
      this.$el.parentNode.removeChild(this.$el)
    },

    methods: {
      setColor (val) {
        store.commit('setColor', val)
      },

      hideUI () {
        store.commit('setVisibility', false)
      },

      showUI () {
        store.commit('setVisibility', true)
      },

      handleViewportChange (event) {
        this.hideUI()

        let self = this
        clearTimeout(scrollTimer)
        scrollTimer = setTimeout(function () {
          self.processViewportChange(event)
        }, 50)
      },

      processViewportChange (event) {
        const doc = document.documentElement
        const pageOffset = {}

        pageOffset.x =
          (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
        pageOffset.y =
          (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)

        port.postMessage({
          type: 'viewportChange',
          pageOffset: { x: pageOffset.x, y: pageOffset.y }
        })
      }
    },

    template: `
    <IframeComponent>
      <PanelComponent/>
      <OverlayComponent/>
    </IframeComponent>`
  })
}
