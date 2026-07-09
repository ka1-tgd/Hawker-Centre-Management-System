// Logs in a vendor using email or username (resolved via Firestore), then checks the Firestore role is "vendor".
// Redirects to the vendor profile page after successful login.
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginIdEl = document.getElementById("loginId");
const passEl = document.getElementById("vendorPassword");
const btn = document.getElementById("btnVendorLogin");
const msg = document.getElementById("msg");

function show(text, color="crimson"){
  msg.textContent = text;
  msg.style.color = color;
}

async function findEmailByUsername(username){
  const qy = query(collection(db, "users"), where("username", "==", username));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  return snap.docs[0].data().email;
}

// ✅ get user profile by email (works even if doc id is NOT uid)
async function getUserByEmail(email){
  const qy = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  return snap.docs[0].data();
}

btn.addEventListener("click", async () => {
  show("");

  const loginId = loginIdEl.value.trim();
  const password = passEl.value;

  if (!loginId || !password){
    show("Please enter username/email and password.");
    return;
  }

  try {
    let email = loginId;

    // If NOT an email, treat as username
    if (!loginId.includes("@")) {
      email = await findEmailByUsername(loginId);
      if (!email) {
        show("Username not found.");
        return;
      }
    }

    // Firebase Auth login
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in UID:", cred.user.uid);

    // ✅ Read Firestore profile by email
    const u = await getUserByEmail(cred.user.email);
    if (!u) {
      show("User profile missing in Firestore (users collection).");
      return;
    }

    if (u.role !== "vendor") {
      show("This account is not a vendor.");
      return;
    }

    window.location.href = "./vendor/profile.html";

  } catch (err) {
    console.error(err);
    show(err.message || "Login failed.");
  }
});
