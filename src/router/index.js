import { createRouter, createWebHistory } from 'vue-router'
import FeeManager from '@/components/FeeManager.vue'
import FeeEdit from '@/components/FeeEdit.vue'
import DiscountManager from '@/components/DiscountManager.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/fees'
    },
    {
      path: '/fees',
      name: 'fees',
      component: FeeManager
    },
    {
      path: '/fees/new',
      name: 'fee-new',
      component: FeeEdit
    },
    {
      path: '/fees/:id',
      name: 'fee-edit',
      component: FeeEdit
    },
    {
      path: '/discounts',
      name: 'discounts',
      component: DiscountManager
    }
  ]
})

export default router
