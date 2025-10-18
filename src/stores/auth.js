import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// Import the auth object from our firebase config
import { auth } from '../firebase/config.js';
import { db } from '../firebase/config.js';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
// Import Firebase auth functions
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  // state
  const currentUser = ref(null);

  // getters
  const isLoggedIn = computed(() => !!currentUser.value);

  /**
   * onAuthStateChanged is a real-time listener from Firebase.
   * It automatically updates the currentUser state whenever the user logs in or out.
   * This replaces our old manual checkLogin() function.
   */
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in. Fetch role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userRole = 'user'; // default role
      let coachId = null;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userRole = userData.role || 'user';
        coachId = userData.coachId || null;
      }
      
      currentUser.value = { 
        email: user.email, 
        uid: user.uid, 
        role: userRole,
        coachId: coachId
      };
    } else {
      // User is signed out.
      currentUser.value = null;
    }
  });

  // actions
  /**
   * Registers a new user with Firebase Authentication.
   * Note: The role logic will be re-added when we set up the Firestore database in the next phase.
   */
  async function register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // --- ADD THIS NEW PART ---
      // Create a user document in Firestore
      const userRole = email.includes('coach') ? 'coach' : 'user';
      let coachId = null;
      
      // If user is a coach, try to find matching coach in coaches collection
      if (userRole === 'coach') {
        try {
          const coachesRef = collection(db, 'coaches');
          const coachQuery = query(coachesRef, where('name', '==', email.split('@')[0].replace('.', ' ')));
          const coachSnapshot = await getDocs(coachQuery);
          
          // Also try to find by email matching coach name (case-insensitive)
          if (coachSnapshot.empty) {
            const allCoachesSnapshot = await getDocs(coachesRef);
            allCoachesSnapshot.forEach((doc) => {
              const coachData = doc.data();
              const coachNameLower = coachData.name.toLowerCase().replace(/\s+/g, '');
              const emailNameLower = email.split('@')[0].toLowerCase().replace(/\./g, '');
              
              if (coachNameLower === emailNameLower) {
                coachId = doc.id;
              }
            });
          } else {
            coachId = coachSnapshot.docs[0].id;
          }
        } catch (error) {
          console.error('Error finding coach:', error);
        }
      }
      
      const userDocRef = doc(db, "users", userCredential.user.uid); // Use auth UID as document ID   
      await setDoc(userDocRef, {
        email: email,
        role: userRole,
        coachId: coachId,
        createdAt: new Date() // Add a creation timestamp
      });
      
      // send welcome email
      try {
        const response = await fetch('https://australia-southeast2-fit5032-nfp-wellness-e219a.cloudfunctions.net/sendWelcomeEmailHttp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('success');
        } else {
          console.log( result.error);
        }
      } catch (emailError) {
        console.log( emailError.message);
      }
      // --- END OF NEW PART ---

      currentUser.value = { 
        email: userCredential.user.email, 
        uid: userCredential.user.uid, 
        role: userRole,
        coachId: coachId
      };

    } catch (error) {
      console.error( error);
      throw new Error(error.message);
    }
  }


  /**
   * Logs in an existing user with Firebase Authentication.
   */
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userRole = 'user'; // default role
      let coachId = null;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userRole = userData.role || 'user';
        coachId = userData.coachId || null;
      }
      
      currentUser.value = { 
        email: userCredential.user.email, 
        uid: userCredential.user.uid,
        role: userRole,
        coachId: coachId
      };
    } catch (error) {
      // Provide a more user-friendly error message
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No user found with this email.');
        case 'auth/wrong-password':
          throw new Error('Incorrect password.');
        default:
          throw new Error('Invalid email or password.');
      }
    }
  }

  /**
   * Logs out the current user.
   */
  async function logout() {
    try {
      await signOut(auth);
      currentUser.value = null;
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }

  // We no longer need checkLogin, onAuthStateChanged handles it.

  return { currentUser, isLoggedIn, register, login, logout };
});