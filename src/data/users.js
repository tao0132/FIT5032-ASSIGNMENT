import { reactive } from 'vue';

// Use reactive to make the users array observable
const users = reactive([]);

/**
 * Loads users from localStorage.
 */
function loadUsers() {
  const usersFromStorage = localStorage.getItem('nfp_users');
  if (usersFromStorage) {
    // Replace the content of the array without creating a new one
    users.splice(0, users.length, ...JSON.parse(usersFromStorage));
  }
}

/**
 * Saves the current users array to localStorage.
 */
function saveUsers() {
  localStorage.setItem('nfp_users', JSON.stringify(users));
}

// Load users initially when the module is imported
loadUsers();

export { users, saveUsers };
