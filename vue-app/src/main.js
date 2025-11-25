import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

import App from './App.vue'
import CardTransaction from './pages/CardTransaction.vue'


const routes = [
  { path: '/', component: CardTransaction }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const pinia = createPinia();

document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector('#vue-app')
  if (el) {
    createApp(App).use(pinia).use(router).mount('#vue-app')
  }
})
