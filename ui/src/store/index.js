import Vue from 'vue'
import Vuex from 'vuex'
import CommonService from '../services/common'
import {getResponseError} from '@/common'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activeIndex: '/storage',
    isAdmin: false,
  },
  mutations: {
    updateActiveIndex(state, activeIndex) {
      state.activeIndex = activeIndex
    },
    updateAdminRole(state, isAdmin) {
      state.isAdmin = isAdmin
    },
  },
  getters: {
    getActiveIndex: (state) => state.activeIndex,
    isAdmin: state => state.isAdmin
  },
  actions: {
    getAdminRole(store, callback) {
      const service = new CommonService()
      service.getAdminRole().then((response) => {
        const {isAdmin} = response['data']
        store.commit('updateAdminRole', isAdmin)
        if (callback) callback()
      }).catch(err => {
        console.error(new Error(getResponseError(err)))
        store.commit('updateAdminRole', false)
      })
    }
  },
  modules: {}
})
