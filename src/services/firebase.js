import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'; // Add enableIndexedDbPersistence

const firebaseConfig = {
  apiKey: "AIzaSyC2BrM0UJ3VeJuvL6lu_7F6Up6a2bb4UiM",
  authDomain: "pokedex-tracker-3df58.firebaseapp.com",
  projectId: "pokedex-tracker-3df58",
  storageBucket: "pokedex-tracker-3df58.appspot.com", // Fixed the storageBucket
  messagingSenderId: "44145765539",
  appId: "1:44145765539:web:ba47dd275e596b197ca316"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Offline persistence can only be enabled in one tab at a time.");
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support offline persistence.");
  }
});

export { 
  auth, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
};