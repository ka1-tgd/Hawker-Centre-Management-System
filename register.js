// Creates a new customer account using Firebase Auth, then writes the user's profile into Firestore (users/{uid}).
// Checks for duplicate usernames first, then redirects to a success page.
import { auth, db } from "./firebase.js";

import { createUserWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== DOM =====
const form = document.getElementById("registerForm");
const usernameEl = document.getElementById("username");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const confirmEl = document.getElementById("confirmPassword");
const msgEl = document.getElementById("msg");

function showMsg(text, color = "crimson") {
  msgEl.textContent = text;
  msgEl.style.color = color;
}

// ===== Check username uniqueness (optional but good) =====
async function usernameExists(usernameLower) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", usernameLower), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameEl.value.trim();
  const usernameLower = username.toLowerCase();
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  const confirmPassword = confirmEl.value;

  if (!username || !email || !password || !confirmPassword) {
    showMsg("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    showMsg("Passwords do not match.");
    return;
  }

  try {
    showMsg("Creating account...", "#1F3A8A");

    // Prevent duplicate usernames
    const exists = await usernameExists(usernameLower);
    if (exists) {
      showMsg("Username already exists. Choose another.");
      return;
    }

    // 1) Create Firebase Auth user (email + password)
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2) Create Firestore profile at users/{uid}
    await setDoc(doc(db, "users", cred.user.uid), {
      username: usernameLower,     // for login.js search (it lowercases) :contentReference[oaicite:5]{index=5}
      displayUsername: username,   // optional, nice for UI
      email,
      role: "customer",
      points: 0,
      createdAt: new Date().toISOString()
    });

    showMsg("Account created ✅", "green");

    // 3) Go success page, then that page sends to login
    window.location.assign("./create-success.html");

  } catch (err) {
    console.error("CREATE ERROR:", err.code, err.message);

    if (err.code === "auth/email-already-in-use") showMsg("Email already in use.");
    else if (err.code === "auth/invalid-email") showMsg("Invalid email format.");
    else if (err.code === "auth/weak-password") showMsg("Password too weak (min 6 chars).");
    else if (err.code === "auth/operation-not-allowed") showMsg("Enable Email/Password in Firebase Auth.");
    else showMsg("Create failed: " + err.code);
  }
});
