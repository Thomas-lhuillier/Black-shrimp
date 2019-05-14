
const getters = {
  getVisibility: state => state.isVisible,
  color: state => state.color,
  getPort: state => state.port,
  getColors: state => state.colors,
  getgroups: state => state.groups,
  colorMode: state => state.colorMode,
  colors: state => state.colors,
  _getColorById: state => id => state.colors[id],
  colorCollection: state => state.colorCollection
}

export default getters
