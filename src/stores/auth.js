import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { users, saveUsers } from '../data/users.js';

export const useAuthStore = defineStore('auth', () => {
  // state
  const currentUser = ref(null);
  const router = useRouter();

  // getters
  const isLoggedIn = computed(() => !!currentUser.value);

  // actions
  function register(email, password) {
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: Date.now(), // Simple unique ID
      email,
      password, // In a real app, this should be hashed
      role: 'user' // Default role
    };

    users.push(newUser);
    saveUsers();
    login(email, password); // Automatically log in after registration
  }

  function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      currentUser.value = user;
      localStorage.setItem('nfp_current_user', JSON.stringify(user));
    } else {
      throw new Error('Invalid email or password');
    }
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem('nfp_current_user');
    router.push('/'); // Redirect to home page after logout
  }

  /**
   * Checks if a user session exists in localStorage and restores it.
   */
  function checkLogin() {
    const userFromStorage = localStorage.getItem('nfp_current_user');
    if (userFromStorage) {
      currentUser.value = JSON.parse(userFromStorage);
    }
  }

  return { currentUser, isLoggedIn, register, login, logout, checkLogin };
});

