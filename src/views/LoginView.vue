<script setup>
import { ref } from 'vue';

// Reactive variables for email and password
const email = ref('');
const password = ref('');

// Handle login logic
function handleLogin() {
  // This is the second type of validation: JavaScript logic check.
  if (password.value.length < 8) {
    alert('Password must be at least 8 characters long.');
    return; // Stop the function if validation fails
  }

  // Check if data binding is successful
  console.log('User attempting login:');
  console.log('Email:', email.value);
  console.log('Password:', password.value);
  
  alert(`Login successful!`);
}
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email address</label>
        <input 
          type="email" 
          id="email"
          v-model="email"
          class="form-control" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password"
          v-model="password"
          class="form-control" 
          required 
        />
      </div>

      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<style scoped>
/* Simple styles for centering and appearance */
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