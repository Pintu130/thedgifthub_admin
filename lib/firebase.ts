// // Import the functions you need from the SDKs you need
// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAnalytics, isSupported } from "firebase/analytics";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
// };

// // Initialize Firebase
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // Initialize Analytics only in client-side and if supported
// let analytics;
// if (typeof window !== 'undefined') {
//   isSupported().then(yes => yes ? analytics = getAnalytics(app) : null);
// }

// // Initialize Firestore and Storage
// export const db = getFirestore(app);
// export const storage = getStorage(app);

// export { app, analytics };

// Import the functions you need from the SDKs you need


// import { initializeApp, getApps, getApp } from "firebase/app"
// import { getAnalytics, isSupported } from "firebase/analytics"
// import { getFirestore } from "firebase/firestore"
// import { getStorage } from "firebase/storage"

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// }

// console.log("Storage bucket from env:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);


// // Initialize Firebase
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// // Initialize Analytics only in client-side and if supported
// let analytics
// if (typeof window !== "undefined") {
//   isSupported().then((yes) => (yes ? (analytics = getAnalytics(app)) : null))
// }

// // Initialize Firestore and Storage
// export const db = getFirestore(app)
// export const storage = getStorage(app)

// export { app, analytics }


// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

console.log("[v0] Firebase Environment Variables Check:")
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID)

const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
)

let app: any = null
let analytics: any = null
let db: any = null
let storage: any = null

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

  // Initialize Analytics only in client-side and if supported
  if (typeof window !== "undefined") {
    isSupported().then((yes) => (yes ? (analytics = getAnalytics(app)) : null))
  }

  // Initialize Firestore and Storage
  db = getFirestore(app)
  storage = getStorage(app)

  console.log("[v0] ✅ Firebase initialized successfully")
} else {
  console.warn("[v0] ⚠️  Firebase environment variables not configured!")
  console.warn("[v0] Please add Firebase environment variables in Project Settings:")
  console.warn("[v0] - NEXT_PUBLIC_FIREBASE_API_KEY")
  console.warn("[v0] - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
  console.warn("[v0] - NEXT_PUBLIC_FIREBASE_PROJECT_ID")
  console.warn("[v0] - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET")
  console.warn("[v0] - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
  console.warn("[v0] - NEXT_PUBLIC_FIREBASE_APP_ID")
  console.warn("[v0] - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID")
}

export { app, analytics, db, storage, hasFirebaseConfig }
