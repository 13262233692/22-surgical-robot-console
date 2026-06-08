import { createRouter, createWebHistory } from 'vue-router'
import ConsolePage from '@/pages/ConsolePage.vue'
import DevicePage from '@/pages/DevicePage.vue'

const routes = [
  {
    path: '/',
    name: 'console',
    component: ConsolePage,
  },
  {
    path: '/device',
    name: 'device',
    component: DevicePage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
