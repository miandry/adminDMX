import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import UserList from './pages/user/UserList.vue'


const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/users', component: UserList }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector('#vue-app')
  if (el) {
    createApp(App).use(router).mount('#vue-app')
  }
})
