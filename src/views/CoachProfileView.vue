<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { coaches } from '../data/coaches.js';

// 1. Get the current route object, which contains URL information.
const route = useRoute();

// 2. Create a computed property to find the correct coach.
const coach = computed(() => {
  // Get the 'id' from the URL, e.g., the '1' in '/coach/1'.
  // route.params.id is a string, so we convert it to a number.
  const coachId = parseInt(route.params.id);

  // Find the coach in our data array whose id matches the URL id.
  return coaches.find(c => c.id === coachId);
});
</script>

<template>
  <div class="container mt-5">
    <div v-if="coach" class="row">
      <div class="col-md-4">
        <img :src="coach.photo" :alt="coach.name" class="img-fluid rounded">
      </div>
      <div class="col-md-8">
        <h1>{{ coach.name }}</h1>
        <div class="my-3">
          <span v-for="spec in coach.specializations" :key="spec" class="badge bg-secondary me-1">
            {{ spec }}
          </span>
        </div>
        <p class="lead">{{ coach.bio }}</p>
        
        <button class="btn btn-success">Book a Session</button>
      </div>
    </div>
    
    <div v-else>
      <h1 class="text-center">Coach not found</h1>
      <p class="text-center">
        <RouterLink to="/coaches">Back to coach list</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for this view */
.img-fluid {
  max-width: 100%;
  height: auto;
}
.lead {
  font-size: 1.1rem;
}
</style>