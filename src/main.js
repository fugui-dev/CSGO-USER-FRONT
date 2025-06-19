import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { ossUrl } from './utils/ossUrl'

import router from "./router"
import axios from "axios";
import VueAxios from "vue-axios";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import { createPinia } from 'pinia';
const pinia = createPinia();

const app = createApp(App)

// 注册为全局属性
app.config.globalProperties.$oss = ossUrl

// 创建全局指令
app.directive('oss', {
  mounted(el, binding) {
    el.src = ossUrl(binding.value)
  },
  updated(el, binding) {
    el.src = ossUrl(binding.value)
  }
})

app.use(ElementPlus,{locale:zhCn})
app.use(router)
app.use(VueAxios,axios)
app.use(pinia)
app.mount('#app')
