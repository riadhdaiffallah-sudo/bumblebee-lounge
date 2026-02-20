// ============================================
// BUMBLEBEE LOUNGE — Firebase Configuration
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyA66Yn5zMkjim2wP-cNYU7_Sd_Be9KDJMU",
  authDomain: "bumblebee-loungedex.firebaseapp.com",
  projectId: "bumblebee-loungedex",
  storageBucket: "bumblebee-loungedex.firebasestorage.app",
  messagingSenderId: "396236080771",
  appId: "1:396236080771:web:b8dc05288280a10081bdb6",
  measurementId: "G-D35C3PRDKN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
