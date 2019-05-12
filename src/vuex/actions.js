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
      if (!storage.colors) { return }
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
      if (!storage.groups) { return }
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
  },

  /**
   * Export the user color collection
   *
   * @param {*} payload The data URL to download
   */
  export (context, payload) {
    context.state.port.postMessage({
      channel: 'tab',
      data: {
        type: 'saveASE',
        url: payload
      }
    })
  },

  /**
   * Send destroy signal to tab
   * Usefull to kill the application from inside the iframe
   */
  destroy (context) {
    context.state.port.postMessage({
      channel: 'tab',
      data: {
        type: 'destroy'
      }
    })
  },

  /**
   * Request color value at coordinates
   * Once backend has processed the request, it will then update the store directly
   * by committing the 'setColor' mutation.
   *
   * @param {*} payload An object containing the coordinates of the point: {x, y}
   */
  getColor (context, payload) {
    context.state.port.postMessage({
      channel: 'worker',
      data: {
        type: 'getColor',
        coord: payload
      }
    })
  }
}

export default actions
