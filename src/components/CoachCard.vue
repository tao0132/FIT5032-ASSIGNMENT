<script setup>

import { RouterLink } from 'vue-router';

// Define the props that this component receives.
defineProps({
  coach: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="card h-100 shadow-sm">
    <img :src="coach.photo" class="card-img-top" :alt="coach.name">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ coach.name }}</h5>
      <div class="mb-2">
        <span v-for="spec in coach.specializations" :key="spec" class="badge bg-secondary me-1">
          {{ spec }}
        </span>
      </div>
      <p class="card-text text-muted flex-grow-1">{{ coach.bio }}</p>
      
      <RouterLink :to="`/coach/${coach.id}`" class="btn btn-primary mt-auto">View Profile</RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* Your styles here */
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>