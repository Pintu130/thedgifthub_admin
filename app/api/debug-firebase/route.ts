import { NextResponse } from "next/server"
import { db, storage, hasFirebaseConfig } from "@/lib/firebase"

export async function GET() {
  try {
    console.log("=== Firebase Debug Info ===")
    console.log("hasFirebaseConfig:", hasFirebaseConfig)
    console.log("db:", !!db)
    console.log("storage:", !!storage)
    
    // Test Firestore connection
    if (db) {
      const testCollection = await db.listCollections()
      console.log("Firestore collections:", testCollection.length)
    }
    
    return NextResponse.json({
      hasFirebaseConfig,
      hasDb: !!db,
      hasStorage: !!storage,
      envVars: {
        NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      }
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      hasFirebaseConfig,
      hasDb: !!db,
      hasStorage: !!storage,
    })
  }
}
