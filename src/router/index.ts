import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/boards',
    name: 'BoardList',
    component: () => import('../views/BoardList.vue')
  },
  {
    path: '/board/:id',
    name: 'BoardEditor',
    component: () => import('../views/BoardEditor.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 需要登录的页面
  const requiresAuth = ['BoardList', 'BoardEditor'];
  const token = localStorage.getItem('token');
  
  if (requiresAuth.includes(to.name as string) && !token) {
    // 未登录，跳转到登录页面
    next('/login');
  } else {
    next();
  }
});

export default router;
