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
  <article class="card h-100 shadow-sm" role="article" :aria-label="`Coach profile for ${coach.name}`">
    <img 
      :src="coach.photo" 
      class="card-img-top" 
      :alt="`Profile photo of ${coach.name}, fitness coach specializing in ${coach.specializations.join(', ')}`"
      loading="lazy"
    >
    <div class="card-body d-flex flex-column">
      <h2 class="card-title h5">{{ coach.name }}</h2>
      <div class="mb-2" role="list" aria-label="Specializations">
        <span 
          v-for="spec in coach.specializations" 
          :key="spec" 
          class="badge bg-secondary me-1"
          role="listitem"
        >
          {{ spec }}
        </span>
      </div>
      <p class="card-text text-muted flex-grow-1">{{ coach.bio }}</p>
      
      <RouterLink 
        :to="`/coach/${coach.id}`" 
        class="btn btn-primary mt-auto"
        :aria-label="`View full profile for ${coach.name}`"
      >
        View Profile
      </RouterLink>
    </div>
  </article>
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