// Root state object
const state = {
  port: chrome.runtime.connect(null, { name: 'app' }),
  isVisible: true,
  color: {},
  colorMode: '', // 'rgb'
  colors: {}, // {id_1: {id: id_1, r: 255, g: 255, b: 255}}
  groups: {}, // {id_1: [ids]}
  colorCollection: [], // [ids]
  groupCollection: [] //  [ids]
}

export default state
