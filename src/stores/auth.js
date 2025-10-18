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
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
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

  /**
   * Logs in with Google using popup
   */
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userRole = 'user'; // default role
      let coachId = null;
      
      if (userDoc.exists()) {
        // Existing user - fetch their role
        const userData = userDoc.data();
        userRole = userData.role || 'user';
        coachId = userData.coachId || null;
      } else {
        // New user - create user document
        userRole = user.email.includes('coach') ? 'coach' : 'user';
        
        // If user is a coach, try to find matching coach in coaches collection
        if (userRole === 'coach') {
          try {
            const coachesRef = collection(db, 'coaches');
            const allCoachesSnapshot = await getDocs(coachesRef);
            
            // Try to match by email or name
            const emailNameLower = user.email.split('@')[0].toLowerCase().replace(/\./g, '');
            const displayNameLower = user.displayName ? user.displayName.toLowerCase().replace(/\s+/g, '') : '';
            
            allCoachesSnapshot.forEach((doc) => {
              const coachData = doc.data();
              const coachNameLower = coachData.name.toLowerCase().replace(/\s+/g, '');
              
              if (coachNameLower === emailNameLower || coachNameLower === displayNameLower) {
                coachId = doc.id;
              }
            });
          } catch (error) {
            console.error('Error finding coach:', error);
          }
        }
        
        // Create user document
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: userRole,
          coachId: coachId,
          createdAt: new Date(),
          authProvider: 'google'
        });
        
        // Send welcome email for new users
        try {
          const response = await fetch('https://australia-southeast2-fit5032-nfp-wellness-e219a.cloudfunctions.net/sendWelcomeEmailHttp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email })
          });
          
          const emailResult = await response.json();
          if (emailResult.success) {
            console.log('Welcome email sent successfully');
          }
        } catch (emailError) {
          console.log('Failed to send welcome email:', emailError.message);
        }
      }
      
      currentUser.value = { 
        email: user.email,
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: userRole,
        coachId: coachId
      };
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Login cancelled');
        case 'auth/popup-blocked':
          throw new Error('Popup blocked by browser. Please allow popups and try again');
        case 'auth/account-exists-with-different-credential':
          throw new Error('An account already exists with this email');
        default:
          throw new Error('Google login failed. Please try again');
      }
    }
  }

  // We no longer need checkLogin, onAuthStateChanged handles it.

  return { currentUser, isLoggedIn, register, login, logout, loginWithGoogle };
});