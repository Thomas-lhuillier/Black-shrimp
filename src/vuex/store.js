/**
 * Store
 *
 * Contains the state of the application,
 * to be shared with application components.
 */

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  isVisible: true,
  isMoving: false,
  activeTab: 'color',
  color: {
    value: {
      hex: '',
      r: '',
      g: '',
      b: '',
      h: '',
      s: '',
      l: ''
    }
  },
  colors: [],
  colorFolders: [],
  cursorOverlay: {
    isVisible: true,
    cursor: 'eyeDropper'
  },
  port: chrome.runtime.connect({ name: 'toolkit' }) // @TODO change to black shrimp
};

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setVisibility(state, val) {
    state.isVisible = val;
  },
  setActiveTab(state, val) {
    state.activeTab = val;
  },
  setColor(state, val) {
    state.color.value = val.value;
  },
  setMovingStatus(state, val) {
    state.isMoving = val;
  },
  setHex(state, val) {
    state.color.value.hex = val;
  },
  setColors(state, arr) {
    state.colors = arr;
    // Save colors in chrome storage.
    chrome.storage.sync.set({ colors: arr }, function() {});
  },
  setColorFolders(state, arr) {
    state.colorFolders = arr;
    // Save color folders in chrome storage.
    chrome.storage.sync.set({ colorFolders: arr }, function() {});
  }
};

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {};

// getters are functions
const getters = {
  getVisibility: state => state.isVisible,
  getMovingStatus: state => state.isMoving,
  getActiveTab: state => state.activeTab,
  getColorState: state => state.color,
  getCursorVisibility: state => state.cursorOverlay.isVisible,
  getCursorType: state => state.cursorOverlay.cursor,
  getPort: state => state.port,
  getColors: state => state.colors,
  getColorFolders: state => state.colorFolders
};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
});
