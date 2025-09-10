import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuthStore } from './stores/auth'; // Import the store

const app = createApp(App);

app.use(createPinia()); // Use Pinia
app.use(router);

// Important: Check login status before mounting the app
const authStore = useAuthStore();
authStore.checkLogin();

app.mount('#app');
