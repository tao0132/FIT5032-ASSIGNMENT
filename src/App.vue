<script setup>
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
          </ul>
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <template v-if="!authStore.isLoggedIn">
              <li class="nav-item">
                <RouterLink class="nav-link" to="/login">Login</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/register">Register</RouterLink>
              </li>
            </template>
            <template v-else>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/profile">
                  Profile ({{ authStore.currentUser.email }})
                </RouterLink>
              </li>
              <li class="nav-item" v-if="authStore.currentUser.role === 'coach'">
                <RouterLink class="nav-link" to="/coach-dashboard">
                  Coach Dashboard
                </RouterLink>
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
</style>