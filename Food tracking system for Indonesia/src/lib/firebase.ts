/**
 * Firebase integration with localStorage demo fallback.
 *
 * To connect Firebase:
 * 1. Create a project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password) and Firestore
 * 3. Copy your config to .env file (see .env.example)
 * 4. Set VITE_FIREBASE_PROJECT_ID (and other vars) to your real values
 *
 * Without env vars the app runs in DEMO MODE using localStorage.
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  updateDoc,
  addDoc,
  orderBy,
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

const FIREBASE_CONFIGURED = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: Firestore | null = null;

if (FIREBASE_CONFIGURED) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db, FIREBASE_CONFIGURED };

// ── Demo Mode (localStorage) ────────────────────────────────────────

type DemoUser = { uid: string; email: string; password: string };

function getDemoUsers(): DemoUser[] {
  try {
    return JSON.parse(localStorage.getItem("demo_users") || "[]");
  } catch {
    return [];
  }
}

function saveDemoUsers(users: DemoUser[]) {
  localStorage.setItem("demo_users", JSON.stringify(users));
}

function getDemoProfiles(): Record<string, UserProfile> {
  try {
    return JSON.parse(localStorage.getItem("demo_profiles") || "{}");
  } catch {
    return {};
  }
}

function saveDemoProfiles(profiles: Record<string, UserProfile>) {
  localStorage.setItem("demo_profiles", JSON.stringify(profiles));
}

function getDemoLogs(): FoodLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem("demo_logs") || "[]");
  } catch {
    return [];
  }
}

function saveDemoLogs(logs: FoodLogEntry[]) {
  localStorage.setItem("demo_logs", JSON.stringify(logs));
}

function getDemoFoods(): Food[] {
  try {
    return JSON.parse(localStorage.getItem("demo_custom_foods") || "[]");
  } catch {
    return [];
  }
}

function saveDemoFoods(foods: Food[]) {
  localStorage.setItem("demo_custom_foods", JSON.stringify(foods));
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Seed admin account if none exist
function seedDemoAdmin() {
  const users = getDemoUsers();
  if (!users.find((u) => u.email === "admin@nutrisiji.id")) {
    const uid = "admin_" + generateId();
    users.push({ uid, email: "admin@nutrisiji.id", password: "admin123" });
    saveDemoUsers(users);
    const profiles = getDemoProfiles();
    profiles[uid] = {
      uid,
      email: "admin@nutrisiji.id",
      name: "Administrator",
      role: "admin",
      height: 170,
      weight: 65,
      age: 30,
      gender: "male",
      job: "Administrator",
      activityLevel: "moderate",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: "id",
    };
    saveDemoProfiles(profiles);
  }
}

seedDemoAdmin();

// ── Unified API ─────────────────────────────────────────────────────

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
      uid: cred.user.uid,
      email,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, "users", cred.user.uid), fullProfile);
    return fullProfile;
  }

  // Demo mode
  const users = getDemoUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("Email sudah terdaftar. Silakan gunakan email lain.");
  }
  const uid = generateId();
  users.push({ uid, email, password });
  saveDemoUsers(users);
  const now = new Date().toISOString();
  const fullProfile: UserProfile = { ...profile, uid, email, createdAt: now, updatedAt: now };
  const profiles = getDemoProfiles();
  profiles[uid] = fullProfile;
  saveDemoProfiles(profiles);
  localStorage.setItem("demo_current_uid", uid);
  return fullProfile;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  if (FIREBASE_CONFIGURED && auth && db) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) throw new Error("Profil pengguna tidak ditemukan.");
    return snap.data() as UserProfile;
  }

  const users = getDemoUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Email atau password salah.");
  localStorage.setItem("demo_current_uid", user.uid);
  const profiles = getDemoProfiles();
  const profile = profiles[user.uid];
  if (!profile) throw new Error("Profil tidak ditemukan.");
  return profile;
}

export async function logoutUser(): Promise<void> {
  if (FIREBASE_CONFIGURED && auth) {
    await signOut(auth);
    return;
  }
  localStorage.removeItem("demo_current_uid");
}

export function getCurrentDemoUid(): string | null {
  return localStorage.getItem("demo_current_uid");
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }
  const profiles = getDemoProfiles();
  return profiles[uid] || null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  if (FIREBASE_CONFIGURED && db) {
    await updateDoc(doc(db, "users", uid), updatedData);
    return;
  }
  const profiles = getDemoProfiles();
  if (profiles[uid]) {
    profiles[uid] = { ...profiles[uid], ...updatedData };
    saveDemoProfiles(profiles);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => d.data() as UserProfile);
  }
  const profiles = getDemoProfiles();
  return Object.values(profiles);
}

export async function deleteUser(uid: string): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await deleteDoc(doc(db, "users", uid));
    return;
  }
  const profiles = getDemoProfiles();
  delete profiles[uid];
  saveDemoProfiles(profiles);
  const users = getDemoUsers().filter((u) => u.uid !== uid);
  saveDemoUsers(users);
}

// ── Food Log Operations ─────────────────────────────────────────────

export async function addFoodLog(entry: Omit<FoodLogEntry, "id">): Promise<FoodLogEntry> {
  const id = generateId();
  const full: FoodLogEntry = { ...entry, id };
  if (FIREBASE_CONFIGURED && db) {
    await setDoc(doc(db, "foodLogs", id), full);
    return full;
  }
  const logs = getDemoLogs();
  logs.push(full);
  saveDemoLogs(logs);
  return full;
}

export async function getUserLogs(uid: string, date?: string): Promise<FoodLogEntry[]> {
  if (FIREBASE_CONFIGURED && db) {
    let q = query(collection(db, "foodLogs"), where("userId", "==", uid));
    if (date) q = query(q, where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FoodLogEntry);
  }
  const logs = getDemoLogs();
  return logs.filter((l) => l.userId === uid && (!date || l.date === date));
}

export async function getAllLogs(): Promise<FoodLogEntry[]> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDocs(collection(db, "foodLogs"));
    return snap.docs.map((d) => d.data() as FoodLogEntry);
  }
  return getDemoLogs();
}

export async function deleteFoodLog(id: string): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await deleteDoc(doc(db, "foodLogs", id));
    return;
  }
  const logs = getDemoLogs().filter((l) => l.id !== id);
  saveDemoLogs(logs);
}

export async function updateFoodLog(id: string, data: Partial<FoodLogEntry>): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await updateDoc(doc(db, "foodLogs", id), data);
    return;
  }
  const logs = getDemoLogs();
  const idx = logs.findIndex((l) => l.id === id);
  if (idx !== -1) {
    logs[idx] = { ...logs[idx], ...data };
    saveDemoLogs(logs);
  }
}

// ── Custom Foods (Admin) ────────────────────────────────────────────

export async function addCustomFood(food: Food): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await setDoc(doc(db, "foods", food.id), food);
    return;
  }
  const foods = getDemoFoods();
  foods.push(food);
  saveDemoFoods(foods);
}

export async function getCustomFoods(): Promise<Food[]> {
  if (FIREBASE_CONFIGURED && db) {
    const snap = await getDocs(collection(db, "foods"));
    return snap.docs.map((d) => d.data() as Food);
  }
  return getDemoFoods();
}

export async function deleteCustomFood(id: string): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await deleteDoc(doc(db, "foods", id));
    return;
  }
  const foods = getDemoFoods().filter((f) => f.id !== id);
  saveDemoFoods(foods);
}

export async function updateCustomFood(id: string, data: Partial<Food>): Promise<void> {
  if (FIREBASE_CONFIGURED && db) {
    await updateDoc(doc(db, "foods", id), data as Record<string, unknown>);
    return;
  }
  const foods = getDemoFoods();
  const idx = foods.findIndex((f) => f.id === id);
  if (idx !== -1) {
    foods[idx] = { ...foods[idx], ...data };
    saveDemoFoods(foods);
  }
}

// ── Auth State Listener ─────────────────────────────────────────────

export function onAuthStateChange(callback: (uid: string | null) => void): () => void {
  if (FIREBASE_CONFIGURED && auth) {
    return onAuthStateChanged(auth, (user: User | null) => callback(user?.uid || null));
  }
  // Demo mode: check localStorage
  const uid = getCurrentDemoUid();
  callback(uid);
  return () => {};
}
