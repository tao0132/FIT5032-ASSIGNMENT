<script setup>

import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { db } from '../firebase/config.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { checkIfUserHasRated, recordUserRating } from '../data/ratingHistory.js';

const route = useRoute();
const authStore = useAuthStore();
const coach = ref(null);
const isLoading = ref(true);
const userRating = ref(0);
const hasRated = ref(false);

async function fetchCoach() {
  const coachId = route.params.id;
  
  // --- DEBUGGING LOG ---
  console.log(`CoachProfileView trying to fetch document with ID: "${coachId}"`);
  
  const docRef = doc(db, 'coaches', coachId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // --- DEBUGGING LOG ---
      console.log("Document found! Data:", docSnap.data());
      coach.value = { id: docSnap.id, ...docSnap.data() };
    } else {
      // --- DEBUGGING LOG ---
      console.error("Firebase returned 'No such document!' for this ID.");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await fetchCoach();
  if (authStore.isLoggedIn && coach.value) {
    hasRated.value = checkIfUserHasRated(authStore.currentUser.uid, coach.value.id);
  }
});

const averageRating = computed(() => {
  if (coach.value && coach.value.ratings?.length > 0) {
    const sum = coach.value.ratings.reduce((a, b) => a + b, 0);
    return (sum / coach.value.ratings.length).toFixed(1);
  }
  return 'No ratings yet';
});

async function submitRating() {
  if (userRating.value > 0 && coach.value && authStore.currentUser) {
    const newRatings = [...coach.value.ratings, userRating.value];
    const docRef = doc(db, 'coaches', coach.value.id);
    await updateDoc(docRef, { ratings: newRatings });
    coach.value.ratings = newRatings;
    recordUserRating(authStore.currentUser.uid, coach.value.id);
    hasRated.value = true;
    alert('Thank you for your rating!');
  } else {
    alert('Please select a rating before submitting.');
  }
}
</script>

<template>
  <div class="container mt-5">
    <div v-if="isLoading">
      <p class="text-center">Loading coach details...</p>
    </div>
    <div v-else-if="coach" class="row">
      <div class="col-md-4">
        <img :src="coach.photo" :alt="coach.name" class="img-fluid rounded">
      </div>
      <div class="col-md-8">
        <h1>{{ coach.name }}</h1>
        <div class="d-flex align-items-center mb-3">
          <span class="fs-4 me-2">⭐ {{ averageRating }}</span>
          <span class="text-muted" v-if="coach.ratings">({{ coach.ratings.length }} ratings)</span>
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
      <p class="text-center">Please check the console for debugging information.</p>
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