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
    <h1>Create an Account</h1>
    <form @submit.prevent="handleRegister" aria-labelledby="register-heading" novalidate>
      <!-- Error message with ARIA live region -->
      <div 
        v-if="error" 
        class="alert alert-danger" 
        role="alert" 
        aria-live="polite"
        aria-atomic="true"
      >
        <span class="visually-hidden">Error:</span>
        {{ error }}
      </div>
      
      <div class="form-group">
        <label for="email">Email address <span aria-label="required" class="required">*</span></label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          class="form-control" 
          required 
          autocomplete="email"
          aria-required="true"
          aria-describedby="email-hint"
          :aria-invalid="error ? 'true' : 'false'"
        />
        <small id="email-hint" class="form-text">Enter a valid email address</small>
      </div>

      <div class="form-group">
        <label for="password">Password <span aria-label="required" class="required">*</span></label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          class="form-control" 
          required 
          autocomplete="new-password"
          aria-required="true"
          aria-describedby="password-hint"
          :aria-invalid="error ? 'true' : 'false'"
        />
        <small id="password-hint" class="form-text">Choose a strong password</small>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password <span aria-label="required" class="required">*</span></label>
        <input 
          type="password" 
          id="confirmPassword" 
          v-model="confirmPassword" 
          class="form-control" 
          required 
          autocomplete="new-password"
          aria-required="true"
          aria-describedby="confirm-password-hint"
          :aria-invalid="error ? 'true' : 'false'"
        />
        <small id="confirm-password-hint" class="form-text">Re-enter your password to confirm</small>
      </div>

      <button type="submit" class="btn btn-primary" aria-label="Create new account">Register</button>

      <p class="mt-3">
        Already have an account? 
        <RouterLink to="/login" aria-label="Navigate to login page">Log in here</RouterLink>
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

.register-container h1 {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
  font-weight: bold;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
}

.form-control:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-control[aria-invalid="true"] {
  border-color: #dc3545;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.btn:focus {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}

.alert {
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.mt-3 {
  margin-top: 1rem;
  text-align: center;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .form-control {
    border-width: 3px;
  }
  
  .btn {
    border: 3px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>