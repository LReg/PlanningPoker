import { createApp } from 'vue';
import '@/assets/main.cc.css';
import App from './App.vue'
import Antd from 'ant-design-vue';
import router from './router'
import 'ant-design-vue/dist/reset.css';
import { loadRuntimeConfig } from '@/environments/environments';
import i18n from '@/i18n';

// Must resolve before any component renders — every service under src/api reads
// `environment` assuming it's already populated.
// (No top-level await: the configured build target doesn't support it.)
loadRuntimeConfig().then(() => {
  const app = createApp(App)

  app.use(router)
  app.use(Antd)
  app.use(i18n)

  app.mount('#app')
})
