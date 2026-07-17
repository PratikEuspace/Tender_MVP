// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { equalTo, get, getDatabase, orderByChild, query, ref } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBNMxu5-yeGYfbx4QLpkz9DkP4RSoIa3xo",
  authDomain: "work-management-568ab.firebaseapp.com",
  databaseURL: "https://work-management-568ab-default-rtdb.firebaseio.com/",
  projectId: "work-management-568ab",
  storageBucket: "work-management-568ab.firebasestorage.app",
  messagingSenderId: "399716633301",
  appId: "1:399716633301:web:4e57c03c2953a33a22b05c",
  measurementId: "G-2TVSR7YWFC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, equalTo, get, orderByChild, query, ref };
export default db;