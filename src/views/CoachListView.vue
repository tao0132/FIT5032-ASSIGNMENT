<script setup>
import { ref } from 'vue';

import { coaches } from '../data/coaches.js';
import CoachCard from '../components/CoachCard.vue';

const coachList = ref(coaches);
</script>

<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Meet Our Coaches</h1>

    <div class="row g-4">
      <div 
        v-for="coach in coachList" 
        :key="coach.id" 
        class="col-12 col-md-6 col-lg-4"
      >
        <CoachCard :coach="coach" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding-bottom: 50px;
}
</style>