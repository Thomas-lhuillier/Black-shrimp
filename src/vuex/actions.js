import uuid from 'uuid/v1'

// Actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {

  /**
   * Create a new color an assign it to the default color collection
   *
   * @param {Object} context
   * @param {Object} payload The rgb values of the color to create : {r, g, b}
   */
  createColor (context, payload) {
    const { r, g, b } = payload
    const id = uuid()
    const color = { r, g, b, id }

    // Register new color
    const colors = { ...context.state.colors, [id]: color }
    context.commit('setColors', { data: colors })

    // Push that color id to defaut color collection
    const colorCollection = [...context.state.colorCollection, id]
    context.commit('setColorCollection', { data: colorCollection })
  },

  /**
   * Create a new empty group
   *
   * @param {Object} context
   */
  addGroup (context) {
    const id = uuid()

    // Register new group
    const groups = { ...context.state.groups, [id]: [] }
    context.commit('setGroups', { data: groups })

    // Push that group to the group collection
    const groupCollection = [...context.state.groupCollection, id]
    context.commit('setGroupCollection', { data: groupCollection })
  },

  /**
   * Delete all colors and folders
   *
   * @param {Object} context
   */
  deleteAll (context) {
    context.commit('setGroupCollection', { data: [] })
    context.commit('setColorCollection', { data: [] })
    context.commit('setGroups', { data: {} })
    context.commit('setColors', { data: {} })
  },

  /**
   * Delete colors and color references
   *
   * @param {Object} context
   * @param {Number|Array} payload The id(s) of colors to delete
   */
  deleteColors (context, payload) {
    const ids = payload.constructor === Array
      ? payload
      : [payload]

    if (ids.length === 0) { return }

    let colors = { ...context.state.colors }
    let colorCollection = [ ...context.state.colorCollection ]
    let groups = { ...context.state.groups }

    ids.forEach(id => {
      // Delete reference to the color
      colorCollection = colorCollection.filter((_id) => { // in default collection
        return _id !== id
      })

      for (let [key, value] of Object.entries(groups)) { // in group collections
        groups[key] = value.filter((_id) => {
          return _id !== id
        })
      }

      // Delete the color itself
      delete colors[id]
    })

    context.commit('setColorCollection', { data: colorCollection })
    context.commit('setGroups', { data: groups })
    context.commit('setColors', { data: colors })
  },

  /**
   * Delete groups and group references
   *
   * @param {Object} context
   * @param {Number|Array} payload The id(s) of groups to delete
   */
  deleteGroups (context, payload) {
    const ids = payload.constructor === Array
      ? payload
      : [payload]

    if (ids.length === 0) { return }

    let groups = { ...context.state.groups }
    let groupCollection = [ ...context.state.groupCollection ]

    ids.forEach(id => {
      // Delete reference to the group
      groupCollection = groupCollection.filter((_id) => {
        return _id !== id
      })

      // Delete the colors the group refer to
      context.dispatch('deleteColors', groups[id])

      // Delete the groups itself
      delete groups[id]
    })

    context.commit('setGroupCollection', { data: groupCollection })
    context.commit('setGroups', { data: groups })
  },

  /**
   * Export the user color collection
   *
   * @param {Object} context
   * @param {String} payload The data URL to download
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
   *
   * @param {Object} context
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
   * @param {Object} context
   * @param {Object} payload An object containing the coordinates of the point: {x, y}
   */
  getColor (context, payload) {
    context.state.port.postMessage({
      channel: 'worker',
      data: {
        type: 'getColor',
        coord: payload
      }
    })
  },

  setColor (context, payload) {
    context.commit('setColor', payload)
  },

  setColorMode (context, payload) {
    context.commit('setColorMode', { data: payload })
  },

  setColorCollection (context, payload) {
    context.commit('setColorCollection', { data: payload })
  },

  setGroups (context, payload) {
    context.commit('setGroups', { data: payload })
  },

  setGroupCollection (context, payload) {
    context.commit('setGroupCollection', { data: payload })
  }
}

export default actions
