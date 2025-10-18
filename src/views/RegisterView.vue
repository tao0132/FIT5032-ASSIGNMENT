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

async function handleGoogleSignup() {
  error.value = null; // Reset error before signup attempt
  try {
    await authStore.loginWithGoogle();
    router.push('/profile'); // Redirect to profile on successful signup
  } catch (err) {
    error.value = err.message; // Display error message on failure
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

      <div class="divider">
        <span>or</span>
      </div>
      
      <button type="button" @click="handleGoogleSignup" class="btn btn-google">
        <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Sign up with Google
      </button>

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
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: white;
}

.register-container h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-google {
  background: white;
  color: #333;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.btn-google:hover {
  background: #f8f9fa;
  border-color: #999;
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.google-icon {
  width: 20px;
  height: 20px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: #999;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 15px;
  font-size: 14px;
}

.mt-3 {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.mt-3 a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.mt-3 a:hover {
  text-decoration: underline;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>