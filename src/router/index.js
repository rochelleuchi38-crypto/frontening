import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Verify from '../views/Verify.vue';
import UserPage from '../views/UserPage.vue';
import CreatePost from '../views/CreatePost.vue';
import EditPost from '../views/EditPost.vue';
import Categories from '../views/Categories.vue';
import Notifications from '../views/Notifications.vue';
import Profile from '../views/Profile.vue';
import Members from '../views/Members.vue';
import MemberCreate from '../views/MemberCreate.vue';
import MemberUpdate from '../views/MemberUpdate.vue';
import api from '../api/api';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/verify',
    name: 'Verify',
    component: Verify
  },
  {
    path: '/home',
    name: 'UserPage',
    component: UserPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/post/create',
    name: 'CreatePost',
    component: CreatePost,
    meta: { requiresAuth: true }
  },
  {
    path: '/post/edit/:id',
    name: 'EditPost',
    component: EditPost,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/:category',
    name: 'CategoryFiltered',
    component: UserPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  // Redirect /search route to /home with query intact
  {
    path: '/search',
    redirect: to => {
      return { path: '/home', query: to.query }
    }
  },
  {
    path: '/admin/members',
    name: 'Members',
    component: Members,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/members/create',
    name: 'MemberCreate',
    component: MemberCreate,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/members/:id/edit',
    name: 'MemberUpdate',
    component: MemberUpdate,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth || to.meta.requiresAdmin) {
    try {
      const response = await api.getCurrentUser();
      if (response.data.success) {
        const role = response.data.user.role;
        if (to.meta.requiresAdmin && role !== 'admin') {
          next('/home');
        } else {
          next();
        }
      } else {
        next('/login');
      }
    } catch (error) {
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
