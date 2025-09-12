import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Real configuration for psctechsuperadmin project
const firebaseConfig = {
  apiKey: "AIzaSyAQF76hBKQy8sn7rAsvYN94IfZl2Zx3oWY",
  authDomain: "psctechsuperadmin.firebaseapp.com",
  projectId: "psctechsuperadmin",
  storageBucket: "psctechsuperadmin.firebasestorage.app",
  messagingSenderId: "768756486561",
  appId: "1:768756486561:web:e2960a3072df2817583be0",
  measurementId: "G-YRM9TG9YYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Real configuration for psctechsuperadmin project
const firebaseConfig = {
  apiKey: "AIzaSyAQF76hBKQy8sn7rAsvYN94IfZl2Zx3oWY",
  authDomain: "psctechsuperadmin.firebaseapp.com",
  projectId: "psctechsuperadmin",
  storageBucket: "psctechsuperadmin.firebasestorage.app",
  messagingSenderId: "768756486561",
  appId: "1:768756486561:web:e2960a3072df2817583be0",
  measurementId: "G-YRM9TG9YYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
