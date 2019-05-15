// Mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// Mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  // Regular mutations
  setVisibility (state, payload) {
    state.isVisible = payload
  },

  setColor (state, payload) {
    state.color = payload
  },

  // Mutations synced with chrome.storage
  //
  // payload model: {
  //   data [Mixed] The mutation data
  //   silent [Boolean] Prevent sync if true (note that this key is not saved)
  // }

  setColors (state, payload) {
    const { data } = payload
    state.colors = data
  },

  setColorCollection (state, payload) {
    const { data } = payload
    state.colorCollection = data
  },

  setGroups (state, payload) {
    const { data } = payload
    state.groups = data
  },

  setGroupCollection (state, payload) {
    const { data } = payload
    state.groupCollection = data
  },

  setColorMode (state, payload) {
    const { data } = payload
    state.colorMode = data
  }
}

export default mutations
