<script setup>

import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { db } from '../firebase/config.js';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { checkIfUserHasRated, recordUserRating } from '../data/ratingHistory.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const coach = ref(null);
const isLoading = ref(true);
const userRating = ref(0);
const hasRated = ref(false);

// Booking related state
const selectedDate = ref('');
const selectedTime = ref('');
const bookingNotes = ref('');
const isSubmittingBooking = ref(false);

// All possible time slots
const allTimeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

// Get minimum date (today)
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Get available time slots based on coach's working hours
const availableTimeSlots = computed(() => {
  if (!coach.value?.workingHours) {
    return allTimeSlots;
  }
  
  const { startTime, endTime } = coach.value.workingHours;
  
  return allTimeSlots.filter(slot => {
    // Convert slot to 24-hour format for comparison
    const slotHour = convertTo24Hour(slot);
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    return slotHour >= startHour && slotHour < endHour;
  });
});

// Convert time string like "09:00 AM" to 24-hour format number
function convertTo24Hour(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours;
}

// Check if selected date is a working day
const isWorkingDay = computed(() => {
  if (!selectedDate.value || !coach.value?.workingHours?.workingDays) {
    return true;
  }
  
  const date = new Date(selectedDate.value + 'T00:00:00');
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDay = dayNames[dayOfWeek];
  
  return coach.value.workingHours.workingDays.includes(selectedDay);
});

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

function navigateToCoachLocation() {
  if (coach.value?.location) {
    router.push({
      name: 'map',
      query: {
        coachLat: coach.value.location.latitude,
        coachLng: coach.value.location.longitude,
        coachName: coach.value.name,
        coachAddress: coach.value.location.address
      }
    });
  }
}

async function submitBooking() {
  if (!authStore.isLoggedIn) {
    alert('Please log in to book a session.');
    router.push('/login');
    return;
  }

  if (!selectedDate.value || !selectedTime.value) {
    alert('Please select both date and time for your booking.');
    return;
  }

  if (!isWorkingDay.value) {
    alert('The selected date is not a working day for this coach. Please select a different date.');
    return;
  }

  isSubmittingBooking.value = true;

  try {
    const bookingData = {
      userId: authStore.currentUser.uid,
      userEmail: authStore.currentUser.email,
      coachId: coach.value.id,
      coachName: coach.value.name,
      coachPhoto: coach.value.photo,
      date: selectedDate.value,
      time: selectedTime.value,
      notes: bookingNotes.value,
      status: 'pending',
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'bookings'), bookingData);
    
    alert('Booking submitted successfully! You can view your bookings in your profile.');
    
    // Reset form
    selectedDate.value = '';
    selectedTime.value = '';
    bookingNotes.value = '';
    
    // Optionally redirect to profile
    router.push('/profile');
    
  } catch (error) {
    console.error('Error submitting booking:', error);
    alert('Failed to submit booking. Please try again.');
  } finally {
    isSubmittingBooking.value = false;
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
        
        <!-- Address and Navigation Section -->
        <div v-if="coach.location" class="card border-primary mb-4">
          <div class="card-body">
            <h5 class="card-title">📍 Work Address</h5>
            <p class="card-text mb-3">
              <i class="bi bi-geo-alt-fill text-primary"></i>
              {{ coach.location.address }}
            </p>
            <button @click="navigateToCoachLocation" class="btn btn-primary">
              🗺️ View on Map & Navigate
            </button>
          </div>
        </div>

        <!-- Working Hours Section -->
        <div v-if="coach.workingHours" class="card border-info mb-4">
          <div class="card-body">
            <h5 class="card-title">🕐 Working Hours</h5>
            <div class="mb-2">
              <strong>Working Days:</strong>
              <span class="ms-2">{{ coach.workingHours.workingDays.join(', ') }}</span>
            </div>
            <div>
              <strong>Working Time:</strong>
              <span class="ms-2">{{ coach.workingHours.startTime }} - {{ coach.workingHours.endTime }}</span>
            </div>
          </div>
        </div>

        <!-- Booking Section -->
        <div v-if="authStore.isLoggedIn" class="card border-success mb-4">
          <div class="card-body">
            <h5 class="card-title">📅 Book a Session</h5>
            <form @submit.prevent="submitBooking">
              <div class="mb-3">
                <label for="bookingDate" class="form-label">Select Date</label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="bookingDate"
                  v-model="selectedDate"
                  :min="minDate"
                  required
                >
                <div v-if="selectedDate && !isWorkingDay" class="alert alert-warning mt-2 mb-0">
                  ⚠️ This coach is not available on the selected date. Please choose a working day:
                  <strong>{{ coach.workingHours?.workingDays.join(', ') }}</strong>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="bookingTime" class="form-label">Select Time</label>
                <select 
                  class="form-select" 
                  id="bookingTime"
                  v-model="selectedTime"
                  required
                >
                  <option value="">Choose a time slot...</option>
                  <option v-for="slot in availableTimeSlots" :key="slot" :value="slot">
                    {{ slot }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="bookingNotes" class="form-label">Notes (Optional)</label>
                <textarea 
                  class="form-control" 
                  id="bookingNotes"
                  v-model="bookingNotes"
                  rows="3"
                  placeholder="Any specific requirements or goals for the session..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                class="btn btn-success w-100"
                :disabled="isSubmittingBooking"
              >
                <span v-if="isSubmittingBooking">Submitting...</span>
                <span v-else>📝 Book Now</span>
              </button>
            </form>
          </div>
        </div>
        <div v-else class="alert alert-warning mb-4">
          Please <RouterLink to="/login">log in</RouterLink> to book a session with this coach.
        </div>
        
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