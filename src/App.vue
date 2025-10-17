<script setup>
// file: src/App.vue

import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';

// Get the auth store instance
const authStore = useAuthStore();
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/">NFP Wellness</RouterLink>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/coaches">Coaches</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/map">Map</RouterLink>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <!-- Show these if the user is NOT logged in -->
            <template v-if="!authStore.isLoggedIn">
              <li class="nav-item">
                <RouterLink class="nav-link" to="/login">Login</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/register">Register</RouterLink>
              </li>
            </template>
            <!-- Show these if the user IS logged in -->
            <template v-else>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/send-email">Feedback</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/profile">
                  Profile ({{ authStore.currentUser.email }})
                </RouterLink>
              </li>
              
              <!-- Dropdown menu for Admin/Coach users -->
              <li class="nav-item dropdown" v-if="authStore.currentUser.role === 'coach'">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Admin Tools
                </a>
                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <!-- Add the new link to the Admin Dashboard here -->
                  <li><RouterLink class="dropdown-item" to="/admin/dashboard">Dashboard</RouterLink></li>
                  <li><RouterLink class="dropdown-item" to="/coach-dashboard">Coach Dashboard</RouterLink></li>
                  <li><RouterLink class="dropdown-item" to="/admin/users">User Management</RouterLink></li>
                  <li><RouterLink class="dropdown-item" to="/admin/coaches">Coach Management</RouterLink></li>
                </ul>
              </li>

              <li class="nav-item">
                <button @click="authStore.logout()" class="btn btn-link nav-link">Logout</button>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
/* Add styles as needed */
.btn-link {
  text-decoration: none;
}
.dropdown-menu {
  /* Aligns dropdown to the right so it doesn't go off-screen */
  right: 0;
  left: auto;
}
</style>
