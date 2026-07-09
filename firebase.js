import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcUlIRmgokZhp_OffbVOB4nVRhwpAIwjg",
  authDomain: "fedproject-7ccab.firebaseapp.com",
  projectId: "fedproject-7ccab",
  storageBucket: "fedproject-7ccab.firebasestorage.app",
  messagingSenderId: "427718035823",
  appId: "1:427718035823:web:64c25ecd0f3f1e6f6f809a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
