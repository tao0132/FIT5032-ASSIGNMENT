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
const confirmPassword = ref('');
const error = ref(null);

async function handleRegister() {
  error.value = null; // Reset error

  // A second type of validation: check if passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }
  
  try {
    // Attempt to register the new user
    await authStore.register(email.value, password.value);
    // On success, the store automatically logs the user in and redirects.
    router.push('/profile');
  } catch (err) {
    error.value = err.message; // Display error (e.g., "User already exists")
  }
}
</script>

<template>
  <div class="register-container">
    <h2>Create an Account</h2>
    <form @submit.prevent="handleRegister">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      
      <div class="form-group">
        <label for="email">Email address</label>
        <input type="email" id="email" v-model="email" class="form-control" required />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" class="form-control" required />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" class="form-control" required />
      </div>

      <button type="submit" class="btn btn-primary">Register</button>

      <p class="mt-3">
        Already have an account? 
        <RouterLink to="/login">Log in here</RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.register-container {
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