<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router'; 
import { useAuthStore } from '../stores/auth.js';

// Get the auth store and router instances
const authStore = useAuthStore();
const router = useRouter();

// Form state
const email = ref('');
const password = ref('');
const error = ref(null); // To store login error messages

async function handleLogin() {
  error.value = null; // Reset error before login attempt
  try {
    await authStore.login(email.value, password.value);
    router.push('/profile'); // Redirect to profile on successful login
  } catch (err) {
    error.value = err.message; // Display error message on failure
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      
      <div class="form-group">
        <label for="email">Email address</label>
        <input type="email" id="email" v-model="email" class="form-control" required />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" class="form-control" required />
      </div>

      <button type="submit" class="btn btn-primary">Login</button>
      
      <p class="mt-3">
        Don't have an account? 
        <RouterLink to="/register">Sign up here</RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
/* You can keep your existing styles */
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
.btn {
  width: 100%;
}
</style>