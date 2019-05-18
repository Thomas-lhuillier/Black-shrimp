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
import createChromeStorageSyncPlugin from './plugins/createChromeStorageSyncPlugin'

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
  switch (request.type) {
    case 'color':
      store.dispatch('setColor', request.data)
      break

    case 'destroy':
      store.dispatch('destroy')
      break
  }
})

export default store
