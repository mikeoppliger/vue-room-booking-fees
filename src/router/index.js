import { createRouter, createWebHistory } from 'vue-router'
import FeeManager from '../components/FeeManager.vue'
import FeeEdit from '../components/FeeEdit.vue'

const routes = [
  {
    path: '/fees',
    name: 'fees',
    component: FeeManager
  },
  {
    path: '/fees/new',
    name: 'new-fee',
    component: FeeEdit
  },
  {
    path: '/fees/:id',
    name: 'edit-fee',
    component: FeeEdit,
    props: true
  },
  {
    path: '/',
    redirect: '/fees'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
