import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCyt9eDjuttp1LmsCyI0K5-WX310AHaheo",
  authDomain: "partyspace-d135f.firebaseapp.com",
  projectId: "partyspace-d135f",
  storageBucket: "partyspace-d135f.firebasestorage.app",
  messagingSenderId: "834325903410",
  appId: "1:834325903410:web:363e51362e43ade5e4242b",
  measurementId: "G-5EZJLQNFCR",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Enable offline persistence for Auth
try {
  setPersistence(auth, browserLocalPersistence);
} catch (error) {
  console.log("Auth persistence already set or not available");
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics only if supported (won't be available in SSR context)
export const analytics = typeof window !== "undefined" && isSupported()
  ? getAnalytics(app)
  : null;
