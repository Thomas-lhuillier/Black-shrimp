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
  port: chrome.runtime.connect(),
  isVisible: true,

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
  colorFolders: []
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

  setColor(state, val) {
    state.color.value = val.value;
  },

  setHex(state, val) {
    state.color.value.hex = val;
  },

  setColors(state, data) {
    state.colors = data;

    chrome.storage.sync.set({ colors: data }, () => {
      console.log('sync chrome storage - colors');
    });
  },

  setColorFolders(state, data) {
    state.colorFolders = data;

    chrome.storage.sync.set({ colorFolders: data }, () => {
      console.log('sync chrome storage - colorFolders');
    });
  }
};

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {
  fetchColors(context) {
    chrome.storage.sync.get('colors', storage => {
      const colors = storage.colors.map((color, index) => {
        return {
          ...color,
          id: index,
          isSelected: false
        };
      });

      context.commit('setColors', colors);
    });
  },

  fetchColorFolders(context) {
    chrome.storage.sync.get('colorFolders', storage => {
      const folders = storage.colorFolders.map((folder, index) => {
        return {
          ...folder,
          id: index,
          isSelected: false
        };
      });

      context.commit('setColorFolders', folders);
    });
  },

  registerColorsListener(context) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes['colors']) {
        context.commit('setColors', changes['colors'].newValue);
      }

      if (changes['colorFolders']) {
        context.commit('setColorFolders', changes['colorFolders'].newValue);
      }
    });
  }
};

// getters are functions
const getters = {
  getVisibility: state => state.isVisible,

  getColor: state => state.color,

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
