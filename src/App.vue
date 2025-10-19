<script setup>
// file: src/App.vue

import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';

// Get the auth store instance
const authStore = useAuthStore();
</script>

<template>
  <!-- Skip to main content link for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <header role="banner">
    <nav class="navbar navbar-expand-lg navbar-light bg-light" role="navigation" aria-label="Main navigation">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/" aria-label="NFP Wellness Home">NFP Wellness</RouterLink>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/" aria-label="Go to home page">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/coaches" aria-label="Browse coaches">Coaches</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/map" aria-label="View coaches on map">Map</RouterLink>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <!-- Show these if the user is NOT logged in -->
            <template v-if="!authStore.isLoggedIn">
              <li class="nav-item">
                <RouterLink class="nav-link" to="/login" aria-label="Login to your account">Login</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/register" aria-label="Register a new account">Register</RouterLink>
              </li>
            </template>
            <!-- Show these if the user IS logged in -->
            <template v-else>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/send-email" aria-label="Send feedback">Feedback</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/profile" :aria-label="`View profile for ${authStore.currentUser.email}`">
                  Profile ({{ authStore.currentUser.email }})
                </RouterLink>
              </li>
              
              <!-- Dropdown menu for Admin/Coach users -->
              <li class="nav-item dropdown" v-if="authStore.currentUser.role === 'coach'">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-haspopup="true">
                  Admin Tools
                </a>
                <ul class="dropdown-menu" aria-labelledby="navbarDropdown" role="menu">
                  <li role="none"><RouterLink class="dropdown-item" to="/admin/dashboard" role="menuitem">Dashboard</RouterLink></li>
                  <li role="none"><RouterLink class="dropdown-item" to="/coach-dashboard" role="menuitem">Coach Dashboard</RouterLink></li>
                  <li role="none"><RouterLink class="dropdown-item" to="/admin/users" role="menuitem">User Management</RouterLink></li>
                  <li role="none"><RouterLink class="dropdown-item" to="/admin/coaches" role="menuitem">Coach Management</RouterLink></li>
                </ul>
              </li>

              <li class="nav-item">
                <button @click="authStore.logout()" class="btn btn-link nav-link" aria-label="Logout from your account">Logout</button>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <main id="main-content" role="main" tabindex="-1">
    <RouterView />
  </main>
</template>

<style scoped>
/* Skip link for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}

.btn-link {
  text-decoration: none;
}

.dropdown-menu {
  /* Aligns dropdown to the right so it doesn't go off-screen */
  right: 0;
  left: auto;
}

/* Enhanced focus indicators for better keyboard navigation */
:deep(a:focus),
:deep(button:focus) {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}

:deep(.nav-link:focus) {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}
</style>
