<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { coaches } from '../data/coaches.js';
import CoachCard from '../components/CoachCard.vue';

// Get the first three coaches to feature on the home page.
const featuredCoaches = computed(() => coaches.slice(0, 3));
</script>

<template>
  <div>
    <section class="hero text-center text-white">
      <div class="hero-content">
        <h1>Empowering Women Through Fitness</h1>
        <p class="lead">Connect with qualified female coaches and start your wellness journey today.</p>
        <RouterLink to="/coaches" class="btn btn-primary btn-lg">Find Your Coach</RouterLink>
      </div>
    </section>

    <section class="how-it-works text-center py-5">
      <div class="container">
        <h2>How It Works</h2>
        <div class="row mt-4">
          <div class="col-md-4">
            <div class="step">
              <div class="step-icon">1</div>
              <h3>Browse Coaches</h3>
              <p>Explore profiles of certified and experienced female fitness coaches.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="step">
              <div class="step-icon">2</div>
              <h3>Book a Session</h3>
              <p>Easily schedule a session at a time that works for you.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="step">
              <div class="step-icon">3</div>
              <h3>Achieve Your Goals</h3>
              <p>Get personalized support to reach your health and wellness targets.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-coaches bg-light py-5">
      <div class="container">
        <h2 class="text-center mb-4">Meet Some of Our Coaches</h2>
        <div class="row g-4">
          <div v-for="coach in featuredCoaches" :key="coach.id" class="col-md-4">
            <CoachCard :coach="coach" />
          </div>
        </div>
        <div class="text-center mt-4">
          <RouterLink to="/coaches" class="btn btn-secondary">View All Coaches</RouterLink>
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
</style>