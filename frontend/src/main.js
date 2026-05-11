import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.min.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
