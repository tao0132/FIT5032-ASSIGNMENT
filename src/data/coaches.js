import { reactive } from 'vue';

// Use reactive to make the coaches array observable
const coaches = reactive([
  {
    id: 1,
    name: 'Jane Doe',
    specializations: ['Strength Training', 'Weight Management'],
    bio: 'A passionate coach dedicated to helping women find their strength and confidence through fitness.',
    photo: 'https://placehold.co/600x400/EFEFEF/333?text=Jane+D.',
    ratings: [5, 4, 5] // Add ratings array with some initial data
  },
  {
    id: 2,
    name: 'Sarah Smith',
    specializations: ['Yoga', 'Rehabilitation', 'Wellbeing'],
    bio: 'With a focus on mindful movement, Sarah helps clients connect their mind and body for long-term health.',
    photo: 'https://placehold.co/600x400/EFEFEF/333?text=Sarah+S.',
    ratings: [5, 5, 4] // Add ratings array
  },
  {
    id: 3,
    name: 'Emily Jones',
    specializations: ['Cardio', 'Group Fitness'],
    bio: 'High-energy and motivating, Emily makes cardio fun and accessible for all fitness levels.',
    photo: 'https://placehold.co/600x400/EFEFEF/333?text=Emily+J.',
    ratings: [4] // Add ratings array
  }
]);

/**
 * Loads coaches from localStorage.
 */
function loadCoaches() {
  const coachesFromStorage = localStorage.getItem('nfp_coaches');
  if (coachesFromStorage) {
    const loadedCoaches = JSON.parse(coachesFromStorage);
    // Update existing coaches with loaded data to maintain reactivity
    loadedCoaches.forEach(loadedCoach => {
      const coach = coaches.find(c => c.id === loadedCoach.id);
      if (coach) {
        Object.assign(coach, loadedCoach);
      }
    });
  }
}

/**
 * Saves the current coaches array to localStorage.
 */
function saveCoaches() {
  localStorage.setItem('nfp_coaches', JSON.stringify(coaches));
}

// Load coaches initially when the module is imported
// loadCoaches();

export { coaches, saveCoaches };

