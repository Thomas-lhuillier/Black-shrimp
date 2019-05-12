// Mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// Mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setState (state, payload) {
    Object.assign(state, payload)
    console.log(state)
  },

  setVisibility (state, payload) {
    state.isVisible = payload
  },

  setColor (state, payload) {
    state.color = payload
  },

  setColorMode (state, payload) {
    state.colorMode = payload
  },

  /**
   * Set colors collection
   *
   * Passing `silent: true` in the payload object will not sync the data with `chrome.storage`,
   * usefull when the mutation is initiated by the storage itself.
   *
   * @param {Object} state
   * @param {Object} payload
   */
  setColors (state, payload) {
    state.colors = payload.colors

    if (payload.silent) { return }
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

    if (payload.silent) { return }
    chrome.storage.sync.set({ groups: state.groups }, () => {})
  }
}

export default mutations
