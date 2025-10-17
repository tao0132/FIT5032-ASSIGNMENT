<script setup>

import { ref, onMounted } from 'vue';
import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';
import CoachCard from '../components/CoachCard.vue';

const coachList = ref([]);
const isLoading = ref(true);

async function fetchCoaches() {
  const coachesCollection = collection(db, 'coaches');
  try {
    console.log('🔍 Fetching coaches from Firestore...');
    const snapshot = await getDocs(coachesCollection);
    
    console.log('📊 Snapshot size:', snapshot.size);
    console.log('📊 Snapshot empty?', snapshot.empty);
    
    // THE FIX IS HERE: Spread doc.data() first, then overwrite the id property.
    coachList.value = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('👤 Coach doc:', doc.id, data);
      return { ...data, id: doc.id };
    });
    
    console.log('✅ Final coachList:', coachList.value);

  } catch (error) {
    console.error("❌ Error fetching coaches: ", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchCoaches);
</script>

<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Meet Our Coaches</h1>
    <div v-if="isLoading" class="text-center">
      <p>Loading coaches...</p>
    </div>
    <div v-else-if="coachList.length === 0" class="text-center">
      <div class="alert alert-warning">
        <h4>No coaches found</h4>
        <p>There are currently no coaches in the database.</p>
        <p class="mb-0">Please use the import tool to add coaches data.</p>
      </div>
    </div>
    <div v-else class="row g-4">
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