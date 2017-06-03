import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    color: {}
  },
  mutations: {
    setColor(state) {
      // state.color = 
      console.log('state', state);
    }
  }
})

export default new Vuex.Store({
  actions,
  getters,
  store
})

