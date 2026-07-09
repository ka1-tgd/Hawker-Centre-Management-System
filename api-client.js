// vendor/api-client.js  (MODULE)
import { db } from "../firebase.js";
import {
  collection, doc, getDoc, getDocs,
  addDoc, setDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// "/inventory" or "/inventory/<docId>"
function parsePath(path){
  // Remove leading/trailing slashes and split
  const cleanPath = String(path || "").replace(/^\/+|\/+$/g, "");
  const parts = cleanPath.split("/");
  return { col: parts[0], id: parts[1] || null };
}

export async function apiGet(path){
  const { col, id } = parsePath(path);
  if(!col) throw new Error("apiGet: missing collection");

  if(!id){
    const snap = await getDocs(collection(db, col));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  const s = await getDoc(doc(db, col, id));
  if(!s.exists()) return null;
  return { id: s.id, ...s.data() };
}

export async function apiPost(path, body){
  const { col } = parsePath(path);
  if(!col) throw new Error("apiPost: missing collection");

  const payload = {
    ...body,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, col), payload);
  return { id: ref.id, ...payload };
}

// Use { merge: true } for partial updates
export async function apiPut(path, body){
  const { col, id } = parsePath(path);
  if(!col || !id) throw new Error("apiPut: needs /collection/docId");

  const payload = { ...body, updatedAt: serverTimestamp() };
  await setDoc(doc(db, col, id), payload, { merge: true });
  return { id, ...payload };
}

export async function apiDelete(path){
  const { col, id } = parsePath(path);
  if(!col || !id) throw new Error("apiDelete: needs /collection/docId");

  await deleteDoc(doc(db, col, id));
  return { ok: true };
}
