import { createApp } from 'vue';
import '@/assets/main.cc.css';
import App from './App.vue'
import Antd from 'ant-design-vue';
import router from './router'
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)

app.use(router)
app.use(Antd)

app.mount('#app')
