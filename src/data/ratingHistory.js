/**
 * Loads the entire rating history object from localStorage.
 * The structure is: { userId1: [coachId1, coachId2], userId2: [coachId1] }
 * @returns {object} The rating history object.
 */
function loadRatingHistory() {
  const history = localStorage.getItem('nfp_user_ratings');
  return history ? JSON.parse(history) : {};
}

/**
 * Saves the rating history object to localStorage.
 * @param {object} history The rating history object to save.
 */
function saveRatingHistory(history) {
  localStorage.setItem('nfp_user_ratings', JSON.stringify(history));
}

/**
 * Checks if a specific user has already rated a specific coach.
 * @param {number} userId The ID of the user.
 * @param {number} coachId The ID of the coach.
 * @returns {boolean} True if the user has rated the coach, false otherwise.
 */
export function checkIfUserHasRated(userId, coachId) {
  const history = loadRatingHistory();
  return history[userId]?.includes(coachId) || false;
}

/**
 * Records that a user has rated a coach.
 * @param {number} userId The ID of the user.
 * @param {number} coachId The ID of the coach.
 */
export function recordUserRating(userId, coachId) {
  const history = loadRatingHistory();
  if (history[userId]) {
    // Add coachId to existing user's rating array if not already present
    if (!history[userId].includes(coachId)) {
      history[userId].push(coachId);
    }
  } else {
    // Create a new entry for the user
    history[userId] = [coachId];
  }
  saveRatingHistory(history);
}