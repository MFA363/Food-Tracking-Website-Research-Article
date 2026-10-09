/**
 * Firebase Authentication and Firestore integration.
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  deleteUser as deleteAuthUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  deleteDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import type { UserProfile, FoodLogEntry, Food } from "./types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.appId].every((value) => typeof value === "string" && value.trim().length > 0);
let FIREBASE_CONFIGURED = false;

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: Firestore | null = null;

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    FIREBASE_CONFIGURED = true;
  } catch { /* Keep public calculators accessible if configuration is invalid. */ }
}

function unavailable(): never {
  throw new Error("Cloud connection is not configured. Please contact the administrator. No data was saved locally.");
}

export { auth, db, FIREBASE_CONFIGURED };
function generateId(): string { return crypto.randomUUID(); }

export async function registerUser(
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">
): Promise<UserProfile> {
  if (FIREBASE_CONFIGURED && auth && db) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const now = new Date().toISOString();
    const fullProfile: UserProfile = {
      ...profile,
      role: "user",
      uid: cred.user.uid,
      email,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, "users", cred.user.uid), fullProfile);
    } catch (error) {
      try { await deleteAuthUser(cred.user); } catch { await signOut(auth); }
      throw error;
    }
    return fullProfile;
  }

  return unavailable();
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  if (FIREBASE_CONFIGURED && auth && db) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      throw new Error("Account profile is unavailable. Contact the administrator before registering again.");
    }
    return snap.data() as UserProfile;
  }

  return unavailable();
}

export async function logoutUser(): Promise<void> {
  if (FIREBASE_CONFIGURED && auth) {
    await signOut(auth);
    return;
  }
  return unavailable();
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }
  return unavailable();
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const { uid: ignoredUid, email: ignoredEmail, createdAt: ignoredCreatedAt, ...editable } = data;
  const updatedData = { ...editable, updatedAt: new Date().toISOString() };
  if (FIREBASE_CONFIGURED && db) {
    await updateDoc(doc(db, "users", uid), updatedData);
    return;
  }
  return unavailable();
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => d.data() as UserProfile);
  }
  return unavailable();
}

export async function deleteUser(uid: string): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await deleteDoc(doc(db, "users", uid));
    return;
  }
  return unavailable();
}

// ── Food Log Operations ─────────────────────────────────────────────

export async function addFoodLog(entry: Omit<FoodLogEntry, "id">): Promise<FoodLogEntry> {
  const required = ['energy', 'protein', 'fat', 'carbohydrate'] as const;
  const optional = ['fiber', 'calcium', 'phosphorus', 'iron', 'sodium', 'potassium', 'copper', 'zinc'] as const;
  const valid = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  if (!Number.isFinite(entry.weightGrams) || entry.weightGrams <= 0 || !entry.nutrients ||
      !required.every(key => valid(entry.nutrients[key])) ||
      !optional.every(key => entry.nutrients[key] === null || valid(entry.nutrients[key]))) {
    throw new Error("Enter a positive food weight and valid nutrient values.");
  }
  const id = generateId();
  const full: FoodLogEntry = { ...entry, id };
  if (FIREBASE_CONFIGURED && db) {
    await setDoc(doc(db, "foodLogs", id), full);
    return full;
  }
  return unavailable();
}

export async function getUserLogs(uid: string, date?: string): Promise<FoodLogEntry[]> {
  if (FIREBASE_CONFIGURED && db) {
    let q = query(collection(db, "foodLogs"), where("userId", "==", uid));
    if (date) q = query(q, where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FoodLogEntry);
  }
  return unavailable();
}

export async function getAllLogs(): Promise<FoodLogEntry[]> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDocs(collection(db, "foodLogs"));
    return snap.docs.map((d) => d.data() as FoodLogEntry);
  }
  return unavailable();
}

export function subscribeUserLogs(uid: string, date: string, next: (entries: FoodLogEntry[]) => void, error: (reason: unknown) => void): () => void {
  if (!FIREBASE_CONFIGURED || !db) {
    error(new Error('Firebase is not configured.'));
    return () => {};
  }
  return onSnapshot(query(collection(db, 'foodLogs'), where('userId', '==', uid), where('date', '==', date)),
    snapshot => next(snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as FoodLogEntry)), error);
}

export async function deleteFoodLog(id: string): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await deleteDoc(doc(db, "foodLogs", id));
    return;
  }
  return unavailable();
}

export async function updateFoodLog(id: string, data: Partial<FoodLogEntry>): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await updateDoc(doc(db, "foodLogs", id), data);
    return;
  }
  return unavailable();
}

// ── Custom Foods (Admin) ────────────────────────────────────────────

export async function addCustomFood(food: Food): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await setDoc(doc(db, "foods", food.id), food);
    return;
  }
  return unavailable();
}

export async function getCustomFoods(): Promise<Food[]> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDocs(collection(db, "foods"));
    return snap.docs.map((d) => d.data() as Food);
  }
  return unavailable();
}

export async function deleteCustomFood(id: string): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await deleteDoc(doc(db, "foods", id));
    return;
  }
  return unavailable();
}

export async function updateCustomFood(id: string, data: Partial<Food>): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await updateDoc(doc(db, "foods", id), data as Record<string, unknown>);
    return;
  }
  return unavailable();
}

// ── Auth State Listener ─────────────────────────────────────────────

export function onAuthStateChange(callback: (uid: string | null) => void): () => void {
  if (FIREBASE_CONFIGURED && auth) {
    return onAuthStateChanged(auth, (user: User | null) => callback(user?.uid || null));
  }
  callback(null);
  return () => {};
}
