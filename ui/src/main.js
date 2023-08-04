import Vue from 'vue'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'
import 'element-ui/lib/theme-chalk/index.css'
import locale from '../node_modules/element-ui/lib/locale/lang/en'

import router from './router'
import App from './views/App'
import store from './store/index'

Vue.config.productionTip = false
Vue.use(ElementUI, {locale})
Vue.use(VueRouter)

new Vue({
  router,
  render: h => h(App),
  store
}).$mount('#app')
