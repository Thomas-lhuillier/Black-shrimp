/**
 * Store
 *
 * Contains the state of the application,
 * to be shared with application components.
 */

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  port: chrome.runtime.connect(),
  isVisible: true,
  color: {},
  colors: [],
  groups: []
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setVisibility (state, payload) {
    state.isVisible = payload
  },

  setColor (state, payload) {
    state.color = payload
  },

  /**
   * Set colors collection
   *
   * Passing `silent: true` in the payload object will not sync the data with `chrome.storage`,
   * usefull when the mutation is iniated by the storage itself.
   *
   * @param {Object} state
   * @param {Object} payload
   */
  setColors (state, payload) {
    state.colors = payload.colors

    if (payload.silent) {
      return
    }

    chrome.storage.sync.set({ colors: state.colors }, () => {})
  },

  /**
   * Set groups collections
   *
   * Passing `silent: true` in the payload object will not sync the data with `chrome.storage`,
   * usefull when the mutation is iniated by the storage itself.
   *
   * @param {Object} state
   * @param {Object} payload
   */
  setGroups (state, payload) {
    state.groups = payload.groups

    if (payload.silent) {
      return
    }

    chrome.storage.sync.set({ groups: state.groups }, () => {})
  }
}

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {
  /**
   * Fetch colors collection
   *
   * When this action is dispatched, we fetch the data from `chrome.storage`
   * and hydrate the state.
   *
   * @param {Object} context
   */
  fetchColors (context) {
    chrome.storage.sync.get('colors', storage => {
      if (!storage.colors) {
        return
      }
      const colors = storage.colors.map((color, index) => {
        return {
          ...color,
          id: index,
          isSelected: false
        }
      })

      context.commit({ type: 'setColors', colors })
    })
  },

  /**
   * Fetch groups collections
   *
   * When this action is dispatched, we fetch the data from `chrome.storage`
   * and hydrate the state.
   *
   * @param {Object} context
   */
  fetchgroups (context) {
    chrome.storage.sync.get('groups', storage => {
      if (!storage.groups) {
        return
      }
      const groups = storage.groups.map((group, index) => {
        return {
          ...group,
          id: index,
          isSelected: false
        }
      })

      context.commit({ type: 'setGroups', groups })
    })
  },

  /**
   * Register Collections listener
   *
   * Dispatch this action to listen for changes comming from `chrome.storage`.
   *
   * @param {Object} context
   */
  registerCollectionsListener (context) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes['colors']) {
        context.commit({
          type: 'setColors',
          colors: changes['colors'].newValue,
          silent: true
        })
      }

      if (changes['groups']) {
        context.commit({
          type: 'setGroups',
          groups: changes['groups'].newValue,
          silent: true
        })
      }
    })
  }
}

// getters are functions
const getters = {
  getVisibility: state => state.isVisible,
  getColor: state => state.color,
  getPort: state => state.port,
  getColors: state => state.colors,
  getgroups: state => state.groups
}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
