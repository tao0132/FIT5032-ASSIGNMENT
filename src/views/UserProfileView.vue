<script setup>
import { useAuthStore } from '../stores/auth.js';

// Get the auth store instance
const authStore = useAuthStore();
</script>

<template>
  <div class="container mt-5">
    <div v-if="authStore.currentUser">
      <h1>Welcome, {{ authStore.currentUser.email }}</h1>
      <p>This is your personal profile page.</p>
      <p>Your appointment details will be displayed here in the future.</p>
      
      <button @click="authStore.logout()" class="btn btn-danger">Logout</button>
    </div>
    
    <div v-else>
      <p>You must be logged in to view this page.</p>
      <RouterLink to="/login">Go to Login</RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* Add styles as needed */
</style>