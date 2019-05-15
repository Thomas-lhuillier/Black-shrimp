/**
 * Store
 *
 * Contains the state of the application,
 * to be shared with application components.
 */

import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'
import createChromeStorageSyncPlugin from './createChromeStorageSyncPlugin'

Vue.use(Vuex)

const filters = {
  'colorMode': 'setColorMode',
  'colors': 'setColors',
  'groups': 'setGroups',
  'colorCollection': 'setColorCollection',
  'groupCollection': 'setGroupCollection'
}
const chromeStorageSyncPlugin = createChromeStorageSyncPlugin(filters)

const store = new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins: [ chromeStorageSyncPlugin ]
})

state.port.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'color') {
    store.dispatch('setColor', request.data)
  }

  if (request.type === 'destroy') {
    store.dispatch('destroy')
  }
})

// store.dispatch('registerCollectionsListener')

export default store
