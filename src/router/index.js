// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import BookingView from '../views/BookingView.vue';
import CoachListView from '../views/CoachListView.vue';
import CoachProfileView from '../views/CoachProfileView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import RegisterView from '../views/RegisterView.vue'; // Import RegisterView

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView }, // Add register route
  { path: '/booking', name: 'booking', component: BookingView },
  { path: '/coaches', name: 'coach-list', component: CoachListView },
  { path: '/coach/:id', name: 'coach-profile', component: CoachProfileView },
  { path: '/profile', name: 'profile', component: UserProfileView }, // Profile route
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;