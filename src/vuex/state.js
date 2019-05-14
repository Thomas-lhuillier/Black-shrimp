// Root state object
const state = {
  port: chrome.runtime.connect(null, { name: 'app' }),
  isVisible: true,
  color: {},
  colors: [],
  groups: [],
  colorMode: '', // 'rgb'

  colors: {
    // id_1: {id: id_1, r: 255, g: 255, b: 255}
  },

  colorCollection: [
    // Used for ordering
    // id_1, id_2, id_3
  ],

  groups: {},
  groupCollection: []
}

export default state
