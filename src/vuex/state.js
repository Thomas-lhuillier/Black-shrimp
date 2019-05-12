// Root state object
const state = {
  port: chrome.runtime.connect(null, { name: 'app' }),
  isVisible: true,
  color: {},
  colors: [],
  groups: [],
  colorMode: ''
}

export default state
