<script setup>
import { computed, ref, onMounted } from 'vue'; // Import onMounted
import { useRoute } from 'vue-router';
import { coaches, saveCoaches } from '../data/coaches.js';
import { useAuthStore } from '../stores/auth.js';
// Import the new rating history functions
import { checkIfUserHasRated, recordUserRating } from '../data/ratingHistory.js';

// Get the auth store and route instances
const authStore = useAuthStore();
const route = useRoute();

// State for the user's new rating
const userRating = ref(0);
// This ref will now be set based on persistent storage
const hasRated = ref(false); 

// Find the correct coach based on the URL parameter
const coach = computed(() => {
  const coachId = parseInt(route.params.id);
  return coaches.find(c => c.id === coachId);
});

// Calculate the average rating for the coach
const averageRating = computed(() => {
  if (coach.value && coach.value.ratings.length > 0) {
    const sum = coach.value.ratings.reduce((a, b) => a + b, 0);
    return (sum / coach.value.ratings.length).toFixed(1);
  }
  return 'No ratings yet';
});

// This function runs once the component is mounted to the page
onMounted(() => {
  if (authStore.isLoggedIn && coach.value) {
    // Check localStorage to see if this user has already rated this coach
    hasRated.value = checkIfUserHasRated(authStore.currentUser.id, coach.value.id);
  }
});

// Function to handle the rating submission
function submitRating() {
  if (userRating.value > 0 && coach.value && authStore.currentUser) {
    // Add the new rating to the coach's ratings array
    coach.value.ratings.push(userRating.value);
    saveCoaches(); // Save the new average rating

    // Record that this user has rated this coach in our persistent history
    recordUserRating(authStore.currentUser.id, coach.value.id);
    
    // Update the UI to prevent rating again
    hasRated.value = true;
    alert('Thank you for your rating!');
  } else {
    alert('Please select a rating before submitting.');
  }
}
</script>

<template>
  <div class="container mt-5">
    <div v-if="coach" class="row">
      <div class="col-md-4">
        <img :src="coach.photo" :alt="coach.name" class="img-fluid rounded">
      </div>
      <div class="col-md-8">
        <h1>{{ coach.name }}</h1>
        
        <div class="d-flex align-items-center mb-3">
          <span class="fs-4 me-2">⭐ {{ averageRating }}</span>
          <span class="text-muted">({{ coach.ratings.length }} ratings)</span>
        </div>

        <div class="my-3">
          <span v-for="spec in coach.specializations" :key="spec" class="badge bg-secondary me-1">
            {{ spec }}
          </span>
        </div>
        <p class="lead">{{ coach.bio }}</p>
        
        <div v-if="authStore.isLoggedIn" class="card bg-light p-3 my-4">
          <div v-if="!hasRated">
            <h5>Rate this coach</h5>
            <div class="rating-stars">
              <span v-for="star in 5" :key="star" class="star" 
                    @click="userRating = star"
                    :class="{ 'selected': star <= userRating }">
                ★
              </span>
            </div>
            <button @click="submitRating" class="btn btn-success mt-2">Submit Rating</button>
          </div>
          <div v-else>
            <p class="mb-0 fw-bold">You have already rated this coach. Thank you!</p>
          </div>
        </div>

        <div v-else class="alert alert-info">
          Please <RouterLink to="/login">log in</RouterLink> to rate this coach.
        </div>
        
      </div>
    </div>
    
    <div v-else>
      <h1 class="text-center">Coach not found</h1>
    </div>
  </div>
</template>

<style scoped>
.star {
  font-size: 2rem;
  cursor: pointer;
  color: #ccc;
  margin-right: 5px;
}
.star.selected {
  color: #ffc107;
}
</style>