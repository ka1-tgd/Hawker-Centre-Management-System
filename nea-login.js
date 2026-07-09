// Logs in an NEA officer using email/username, verifies the user's role is "nea", then redirects to the NEA dashboard.
// Also ensures a usable Firestore user profile exists and stores the officer info in localStorage.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc, getDoc, setDoc,
  collection, query, where, getDocs, limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== Firebase config =====
const firebaseConfig = {
  apiKey: "AIzaSyAcUlIRmgokZhp_OffbVOB4nVRhwpAIwjg",
  authDomain: "fedproject-7ccab.firebaseapp.com",
  projectId: "fedproject-7ccab",
  storageBucket: "fedproject-7ccab.firebasestorage.app",
  messagingSenderId: "427718035823",
  appId: "1:427718035823:web:64c25ecd0f3f1e6f6f809a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== Match your nea-officer-login.html IDs =====
const loginIdEl = document.getElementById("loginId");
const passEl = document.getElementById("password");
const btn = document.getElementById("btnLogin");
const msgEl = document.getElementById("msg");

function showMsg(text, color = "crimson") {
  msgEl.textContent = text;
  msgEl.style.color = color;
}

// If user types username instead of email, find email from Firestore
async function resolveEmailFromLogin(loginId) {
  if (loginId.includes("@")) return loginId;

  const q = query(
    collection(db, "users"),
    where("username", "==", loginId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const data = snap.docs[0].data();
  return data.email || null;
}

// 🔍 Find user profile even if Firestore doc ID is NOT uid
async function getUserProfileFlexible(uid, email) {
  // 1) Try users/{uid}
  const directRef = doc(db, "users", uid);
  const directSnap = await getDoc(directRef);
  if (directSnap.exists()) {
    return { ref: directRef, data: directSnap.data(), foundBy: "docId" };
  }

  // 2) Try query by uid field (if you store uid inside the doc)
  const qUid = query(collection(db, "users"), where("uid", "==", uid), limit(1));
  const snapUid = await getDocs(qUid);
  if (!snapUid.empty) {
    return { ref: snapUid.docs[0].ref, data: snapUid.docs[0].data(), foundBy: "uidField" };
  }

  // 3) Try query by email field (very common)
  if (email) {
    const qEmail = query(collection(db, "users"), where("email", "==", email), limit(1));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      return { ref: snapEmail.docs[0].ref, data: snapEmail.docs[0].data(), foundBy: "emailField" };
    }
  }

  return null;
}

btn.addEventListener("click", async () => {
  const loginId = (loginIdEl.value || "").trim().toLowerCase();
  const password = (passEl.value || "").trim();

  if (!loginId || !password) return showMsg("Please enter Officer ID/Email and password.");

  try {
    showMsg("Signing in...", "#1F3A8A");

    const email = await resolveEmailFromLogin(loginId);
    if (!email) return showMsg("Officer account not found in Firestore users (no matching username/email).");

    // 1) Auth login
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const authEmail = cred.user.email || email;

    // 2) Get Firestore profile (flexible lookup)
    const result = await getUserProfileFlexible(uid, authEmail);
    if (!result) {
      await signOut(auth);
      return showMsg("Login ok, but no matching user profile in Firestore users collection.");
    }

    const profile = result.data;
    const role = (profile.role || "").toLowerCase();

    if (role !== "nea") {
      await signOut(auth);
      return showMsg("Unauthorized: this account is not an NEA officer.");
    }

    // 3) OPTIONAL: ensure users/{uid} exists for easier reading in other pages
    // Copies existing profile into users/{uid} (merge so it won’t wipe fields)
    const ensureRef = doc(db, "users", uid);
    await setDoc(
      ensureRef,
      { ...profile, uid, email: authEmail, role: profile.role || "nea" },
      { merge: true }
    );

    // Save for your pages
    localStorage.setItem("currentUser", JSON.stringify({ uid, ...profile, email: authEmail }));

    // 4) Redirect
    window.location.href = "./Nea_officer/nea-dashboard.html";
  } catch (err) {
    console.error(err);
    const code = err?.code || "";

    if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
      return showMsg("Wrong email/ID or password.");
    }
    if (code.includes("auth/user-not-found")) {
      return showMsg("No such account in Authentication.");
    }
    return showMsg("Login failed. Check console for details.");
  }
});
