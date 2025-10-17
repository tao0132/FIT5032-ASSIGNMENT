import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CoachListView from '../views/CoachListView.vue';
import CoachProfileView from '../views/CoachProfileView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import CoachDashboardView from '../views/CoachDashboardView.vue'; // Import the new dashboard view
import { useAuthStore } from '../stores/auth';
import AdminUsersView from '../views/AdminUsersView.vue';
import AdminCoachesView from '../views/AdminCoachesView.vue';
import MapView from '../views/MapView.vue';
import AdminDashboardView from '../views/AdminDashboardView.vue';
import SendEmailView from '../views/SendEmailView.vue';


const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/coaches', name: 'coach-list', component: CoachListView },
  { path: '/coach/:id', name: 'coach-profile', component: CoachProfileView },
  { 
    path: '/profile', 
    name: 'profile', 
    component: UserProfileView,
    meta: { requiresAuth: true } // Add meta field to indicate this route needs authentication
  },
  {
    path: '/coach-dashboard',
    name: 'coach-dashboard',
    component: CoachDashboardView,
    meta: { requiresAuth: true, requiredRole: 'coach' } // This route requires auth and a specific role
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
    meta: { requiresAuth: true, requiredRole: 'coach' } // Or 'admin' if create one
  },
  {
    path: '/admin/coaches',
    name: 'admin-coaches',
    component: AdminCoachesView,
    meta: { requiresAuth: true, requiredRole: 'coach' } // Or 'admin'
  },
  {
    path: '/map',
    name: 'map',
    component: MapView,
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiredRole: 'coach' } // Or 'admin'
  },
  {
    path: '/send-email',
    name: 'send-email',
    component: SendEmailView,
    meta: { requiresAuth: true } // 
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.requiredRole;

  // Check if the route requires authentication and if the user is not logged in
  if (requiresAuth && !authStore.isLoggedIn) {
    // Redirect to login page if not authenticated
    next({ name: 'login' });
  } 
  // Check if the route requires a specific role and if the user's role does not match
  else if (requiredRole && authStore.currentUser?.role !== requiredRole) {
    // Redirect to home page if user does not have the required role
    // In a real app, you might redirect to a "403 Not Authorized" page
    alert('You are not authorized to view this page.');
    next({ name: 'home' });
  } 
  // If all checks pass, allow navigation
  else {
    next();
  }
});

export default router;
