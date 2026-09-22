import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { Loading } from 'quasar'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to) => {
    Loading.show({ message: 'Loading...' }) // ✅ idagdag dito

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const token = localStorage.getItem('authToken')

    if (requiresAuth && !token) {
      return { name: 'login' }
    }

    const allowedRoles = to.matched.flatMap((record) => record.meta.roles || [])
    if (!allowedRoles.length) {
      return true
    }

    let roles = []
    try {
      roles = JSON.parse(localStorage.getItem('authUser') || '{}').roles || []
    } catch {
      roles = []
    }

    if (allowedRoles.some((role) => roles.includes(role))) {
      return true
    }

    if (roles.includes('office_admin')) {
      return { name: 'office-dashboard' }
    }
    if (roles.includes('hr_admin')) {
      return { name: 'dashboard' }
    }

    return { name: 'login' }
  })

  Router.afterEach(() => {
    Loading.hide() // ✅ idagdag dito para matapos yung loading pagdating sa bagong page
  })

  return Router
})