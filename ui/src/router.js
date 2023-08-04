import VueRouter from 'vue-router'
import {authAccount} from './common'

const SignIn = () => import('./views/SignIn')
const Storage = () => import('./views/Storage')
const Bucket = () => import('./views/Bucket')
const NotFound = () => import('./views/NotFound')

const router = new VueRouter({
  mode: 'history',
  routes: [
    {path: '/', redirect: '/storage'},
    {path: '', redirect: '/storage'},
    {path: '/sign-in', component: SignIn,},
    {path: '/storage', component: Storage,},
    {path: '/bucket', component: Bucket,},
    {path: '/404', component: NotFound,},
    {path: '*', redirect: '/404'},
  ]
})

router.beforeEach((to, from, next) => {
  authAccount(err => {
    if (err && to.path !== '/sign-in') {
      next({path: `/sign-in`})
    }

    next()
  })
})

export default router
