<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { db } from '../firebase/config.js';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import CoachCard from '../components/CoachCard.vue';

// Fetch coaches from Firestore
const featuredCoaches = ref([]);
const isLoadingCoaches = ref(true);

async function fetchFeaturedCoaches() {
  try {
    console.log('HomeView: Fetching featured coaches from Firestore...');
    // Get first 3 coaches from Firestore
    const coachesQuery = query(collection(db, 'coaches'));
    const snapshot = await getDocs(coachesQuery);
    
    featuredCoaches.value = snapshot.docs
      .slice(0, 3) // Get first 3
      .map(doc => ({ ...doc.data(), id: doc.id }));
    
    console.log('HomeView: Loaded coaches:', featuredCoaches.value);
  } catch (error) {
    console.error('HomeView: Error fetching coaches:', error);
  } finally {
    isLoadingCoaches.value = false;
  }
}

onMounted(fetchFeaturedCoaches);
</script>

<template>
  <div>
    <section class="hero text-center text-white" aria-label="Hero section">
      <div class="hero-content">
        <h1>Empowering Women Through Fitness</h1>
        <p class="lead">Connect with qualified female coaches and start your wellness journey today.</p>
        <RouterLink to="/coaches" class="btn btn-primary btn-lg" aria-label="Find your fitness coach">
          Find Your Coach
        </RouterLink>
      </div>
    </section>

    <section class="how-it-works text-center py-5" aria-labelledby="how-it-works-heading">
      <div class="container">
        <h2 id="how-it-works-heading">How It Works</h2>
        <div class="row mt-4" role="list">
          <div class="col-md-4" role="listitem">
            <div class="step">
              <div class="step-icon" aria-hidden="true">1</div>
              <h3>Browse Coaches</h3>
              <p>Explore profiles of certified and experienced female fitness coaches.</p>
            </div>
          </div>
          <div class="col-md-4" role="listitem">
            <div class="step">
              <div class="step-icon" aria-hidden="true">2</div>
              <h3>Book a Session</h3>
              <p>Easily schedule a session at a time that works for you.</p>
            </div>
          </div>
          <div class="col-md-4" role="listitem">
            <div class="step">
              <div class="step-icon" aria-hidden="true">3</div>
              <h3>Achieve Your Goals</h3>
              <p>Get personalized support to reach your health and wellness targets.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-coaches bg-light py-5" aria-labelledby="featured-coaches-heading">
      <div class="container">
        <h2 id="featured-coaches-heading" class="text-center mb-4">Meet Some of Our Coaches</h2>
        <div v-if="isLoadingCoaches" class="text-center" role="status" aria-live="polite">
          <span class="visually-hidden">Loading coaches...</span>
          <p aria-hidden="true">Loading coaches...</p>
        </div>
        <div v-else-if="featuredCoaches.length === 0" class="text-center" role="status">
          <p class="text-muted">No coaches available at the moment.</p>
        </div>
        <div v-else class="row g-4" role="list" aria-label="Featured coaches">
          <div v-for="coach in featuredCoaches" :key="coach.id" class="col-md-4" role="listitem">
            <CoachCard :coach="coach" />
          </div>
        </div>
        <div class="text-center mt-4">
          <RouterLink to="/coaches" class="btn btn-secondary" aria-label="View all available coaches">
            View All Coaches
          </RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* Scoped styles for the Home page */

.hero {
  /* You should replace this with a real background image */
  background: #444 url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070') no-repeat center center;
  background-size: cover;
  padding: 100px 20px;
  position: relative;
}

.hero::before {
  /* This creates a dark overlay for better text readability */
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.hero-content {
  /* This ensures the content is on top of the overlay */
  position: relative;
  z-index: 1;
}

.how-it-works h2, .featured-coaches h2 {
  margin-bottom: 2rem;
}

.step-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #0d6efd; /* Bootstrap primary blue */
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 60px;
  margin: 0 auto 1rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>