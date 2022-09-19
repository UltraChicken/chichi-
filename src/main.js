import Vue from 'vue'
import App from './App.vue'
import store from './store'

import router from './router'
import chickenToast from './base/chicken-toast'

import Icon from './base/chicken-icon/chicken-icon.vue'
import '@/styles/index.less'
import VueLazyload from 'vue-lazyload'
Vue.config.productionTip = false

// 弹出层
Vue.use(chickenToast)

// icon 组件
Vue.component(Icon.name, Icon)

// 懒加载
Vue.use(VueLazyload, {
  preLoad: 1,
  loading: require('./assets/img/default.png')
})
new Vue({
  store,
  router,
  render: h => h(App),
  beforeCreate() {
    Vue.prototype.$bus = this
  }
}).$mount('#chickenPlayer')
