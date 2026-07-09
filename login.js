// Logs in a customer by finding their email from Firestore username, then signs in with Firebase Auth.
// Saves basic user info to localStorage and redirects to the customer homepage.
import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ======================
   DOM elements
====================== */
const form = document.getElementById("loginForm");
const usernameEl = document.getElementById("loginUsername");
const passwordEl = document.getElementById("loginPassword");
const msgEl = document.getElementById("msg");

/* ======================
   UI helpers
====================== */
function showMsg(text, color = "crimson") {
  if (!msgEl) return;
  msgEl.textContent = text;
  msgEl.style.color = color;
}

/* ======================
   Find user doc by username
   (username should be stored lowercase in Firestore)
====================== */
async function findUserByUsername(usernameLower) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", usernameLower), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/* ======================
   Login submit
====================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameEl.value.trim().toLowerCase();
  const password = passwordEl.value.trim();

  if (!username || !password) {
    showMsg("Please enter username and password.");
    return;
  }

  try {
    showMsg("Logging in...", "#1F3A8A");

    // 1) Find the user's email by username (Firestore)
    const userDoc = await findUserByUsername(username);

    if (!userDoc) {
      showMsg("Wrong username.");
      return;
    }

    if (!userDoc.email) {
      showMsg("No email saved for this username in Firestore.");
      return;
    }

    console.log("Logging in with email:", userDoc.email);

    // 2) Sign in using Firebase Auth (email + password)
    await signInWithEmailAndPassword(auth, userDoc.email, password);

    // 3) OPTIONAL: store small info for UI (not required for auth)
    localStorage.setItem("currentUser", JSON.stringify({
      username: userDoc.username,
      email: userDoc.email,
      role: userDoc.role || "customer"
    }));

    showMsg("Login success ✅ Redirecting...", "green");

    // 4) Redirect to profile
    window.location.href = "./customer/Homepage.html";

  } catch (err) {
    console.error("LOGIN ERROR:", err.code, err.message);

    // show friendly error message
    if (err.code === "auth/user-not-found") showMsg("This email is not in Firebase Auth.");
    else if (err.code === "auth/wrong-password") showMsg("Wrong password.");
    else if (err.code === "auth/invalid-credential") showMsg("Invalid credential (email/password mismatch).");
    else if (err.code === "auth/invalid-email") showMsg("Invalid email stored for this user.");
    else if (err.code === "auth/too-many-requests") showMsg("Too many attempts. Try again later.");
    else if (err.code === "auth/configuration-not-found") showMsg("Auth not configured. Add 127.0.0.1 to Authorized domains.");
    else showMsg("Login failed: " + err.code);
  }
});
