import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2BrM0UJ3VeJuvL6lu_7F6Up6a2bb4UiM",
  authDomain: "pokedex-tracker-3df58.firebaseapp.com",
  projectId: "pokedex-tracker-3df58",
  storageBucket: "pokedex-tracker-3df58.firebasestorage.app",
  messagingSenderId: "44145765539",
  appId: "1:44145765539:web:ba47dd275e596b197ca316"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };