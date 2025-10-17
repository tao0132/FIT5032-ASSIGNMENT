<script setup>
// file: src/views/AdminDashboardView.vue

import { ref, onMounted } from 'vue';
import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';
// Import the new chart component
import UserRoleChart from '../components/UserRoleChart.vue';

// ... (refs for stats and isLoading remain the same)
const totalUsers = ref(0);
const totalCoaches = ref(0);
const usersByRole = ref({ user: 0, coach: 0 });
const isLoading = ref(true);

async function fetchDashboardData() {
  try {
    const usersPromise = getDocs(collection(db, 'users'));
    const coachesPromise = getDocs(collection(db, 'coaches'));
    const [usersSnapshot, coachesSnapshot] = await Promise.all([usersPromise, coachesPromise]);

    totalUsers.value = usersSnapshot.size;
    totalCoaches.value = coachesSnapshot.size;

    const roleCounts = { user: 0, coach: 0 };
    usersSnapshot.docs.forEach(doc => {
      const userRole = doc.data().role;
      if (roleCounts.hasOwnProperty(userRole)) {
        roleCounts[userRole]++;
      }
    });
    usersByRole.value = roleCounts;

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchDashboardData);
</script>

<template>
  <div class="container mt-5">
    <h1 class="mb-4">Admin Dashboard</h1>

    <div v-if="isLoading">
      <p>Loading dashboard data...</p>
    </div>

    <div v-else>
      <div class="row">
        <!-- Stat Cards -->
        <div class="col-md-4">
          <div class="card text-white bg-primary mb-3">
            <div class="card-header">Total Users</div>
            <div class="card-body">
              <h5 class="card-title display-4">{{ totalUsers }}</h5>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-white bg-success mb-3">
            <div class="card-header">Total Coaches</div>
            <div class="card-body">
              <h5 class="card-title display-4">{{ totalCoaches }}</h5>
            </div>
          </div>
        </div>
        <div class="col-md-4">
           <div class="card text-dark bg-light mb-3">
             <div class="card-header">User Role Distribution</div>
             <div class="card-body">
               <p class="card-text">Regular Users: <strong>{{ usersByRole.user }}</strong></p>
               <p class="card-text">Coaches: <strong>{{ usersByRole.coach }}</strong></p>
             </div>
           </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              User Roles Chart
            </div>
            <div class="card-body chart-container">
              <!-- Add the chart component here -->
              <UserRoleChart :chartData="usersByRole" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-header {
  font-weight: bold;
}
.chart-container {
  /* Set a fixed height for the chart container */
  height: 300px;
}
</style>