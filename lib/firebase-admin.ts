import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import type { Bucket } from "@google-cloud/storage"

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

const storageBucketName =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  undefined

let adminApp: App | null = null
let adminAuth: ReturnType<typeof getAuth> | null = null
let adminDb: ReturnType<typeof getFirestore> | null = null
let adminBucket: Bucket | null = null

if (
  firebaseAdminConfig.projectId &&
  firebaseAdminConfig.clientEmail &&
  firebaseAdminConfig.privateKey
) {
  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: firebaseAdminConfig.projectId,
      ...(storageBucketName ? { storageBucket: storageBucketName } : {}),
    })
  } else {
    adminApp = getApps()[0]!
  }

  adminAuth = getAuth(adminApp)
  adminDb = getFirestore(adminApp)
  try {
    const storage = getStorage(adminApp)
    adminBucket = storageBucketName ? storage.bucket(storageBucketName) : storage.bucket()
  } catch (e) {
    console.warn("[Firebase Admin] Storage bucket init failed:", e)
  }
} else {
  console.warn("[Firebase Admin] Missing admin credentials. Admin features will not work.")
}

export { adminApp, adminAuth, adminDb, adminBucket }
