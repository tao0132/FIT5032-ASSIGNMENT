import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Add Bootstrap JavaScript
// Import Vue3EasyDataTable
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

const app = createApp(App);

app.use(createPinia()); // Use Pinia
app.use(router);
// Register Vue3EasyDataTable globally
app.component('EasyDataTable', Vue3EasyDataTable);

app.mount('#app');
