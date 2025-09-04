import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage, hasFirebaseConfig } from "@/lib/firebase"

export interface Product {
  id?: string
  name: string
  amount: string
  discount: string
  availableOffers: string
  highlights: string
  images: string[]
  createdAt?: any
  updatedAt?: any
}

// GET - Fetch all products
export async function GET() {
  try {
    console.log("[v0] Starting GET products request")
    console.log("[v0] Firebase config available:", hasFirebaseConfig)
    console.log("[v0] Firebase db instance:", !!db)

    if (!hasFirebaseConfig || !db) {
      console.error("[v0] Firebase not configured - please add environment variables")
      return NextResponse.json(
        {
          error: "Firebase not configured",
          message: "Please add Firebase environment variables in Project Settings",
          requiredVars: [
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
            "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
            "NEXT_PUBLIC_FIREBASE_APP_ID",
          ],
        },
        { status: 503 },
      )
    }

    const productsRef = collection(db, "products")
    console.log("[v0] Created products collection reference")

    const q = query(productsRef, orderBy("createdAt", "desc"))
    console.log("[v0] Created query with orderBy")

    const querySnapshot = await getDocs(q)
    console.log("[v0] Got query snapshot, docs count:", querySnapshot.docs.length)

    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]

    console.log("[v0] Mapped products:", products.length)
    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : "No stack trace",
    })

    if ((error as any)?.code === "permission-denied") {
      return NextResponse.json(
        {
          error: "Permission denied",
          details:
            "Firestore security rules are blocking this operation. Please configure Firestore rules to allow read access.",
          suggestion: "Go to Firebase Console → Firestore Database → Rules and update security rules.",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting POST products request")
    console.log("[v0] Firebase config available:", hasFirebaseConfig)
    console.log("[v0] Firebase db instance:", !!db)
    console.log("[v0] Firebase storage instance:", !!storage)

    if (!hasFirebaseConfig || !db || !storage) {
      console.error("[v0] Firebase not configured - please add environment variables")
      return NextResponse.json(
        {
          error: "Firebase not configured",
          message: "Please add Firebase environment variables in Project Settings",
          requiredVars: [
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
            "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
            "NEXT_PUBLIC_FIREBASE_APP_ID",
          ],
        },
        { status: 503 },
      )
    }

    const formData = await request.formData()
    console.log("[v0] Got form data")

    // Extract product data
    const name = formData.get("name") as string
    const amount = formData.get("amount") as string
    const discount = formData.get("discount") as string
    const availableOffers = formData.get("availableOffers") as string
    const highlights = formData.get("highlights") as string

    console.log("[v0] Extracted product data:", { name, amount, discount })

    // Extract images
    const images: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image") && value instanceof File) {
        images.push(value)
        console.log("[v0] Found image:", key, value.name, value.size)
      }
    }

    console.log("[v0] Total images found:", images.length)

    // Validate required fields
    if (!name || !amount || images.length < 2 || images.length > 4) {
      console.log("[v0] Validation failed:", { name: !!name, amount: !!amount, imageCount: images.length })
      return NextResponse.json({ error: "Invalid data. Name, amount required and 2-4 images needed." }, { status: 400 })
    }

    // Upload images to Firebase Storage
    const imageUrls: string[] = []
    console.log("[v0] Starting image uploads")

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const timestamp = Date.now()
      const fileName = `products/${timestamp}_${i}_${image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      console.log("[v0] Uploading image:", fileName, "Size:", image.size)

      try {
        const storageRef = ref(storage, fileName)
        console.log("[v0] Created storage reference for:", fileName)

        // Convert File to ArrayBuffer for better compatibility
        const arrayBuffer = await image.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        console.log("[v0] Converted image to buffer, uploading...")
        const snapshot = await uploadBytes(storageRef, uint8Array, {
          contentType: image.type || "image/jpeg",
        })

        console.log("[v0] Upload successful, getting download URL...")
        const downloadURL = await getDownloadURL(snapshot.ref)
        imageUrls.push(downloadURL)
        console.log("[v0] Image uploaded successfully:", downloadURL)
      } catch (uploadError) {
        console.error("[v0] Error uploading image:", fileName, uploadError)
        console.error("[v0] Upload error details:", {
          code: (uploadError as any)?.code,
          message: (uploadError as any)?.message,
          serverResponse: (uploadError as any)?.serverResponse,
        })

        return NextResponse.json(
          {
            error: "Failed to upload image",
            details: `Image upload failed: ${(uploadError as any)?.message || "Unknown storage error"}`,
            storageError: (uploadError as any)?.code,
            suggestion:
              "Please check Firebase Storage rules. You may need to configure storage rules to allow uploads.",
          },
          { status: 500 },
        )
      }
    }

    console.log("[v0] All images uploaded, creating document")

    // Create product document
    const productsRef = collection(db, "products")
    const docRef = await addDoc(productsRef, {
      name,
      amount,
      discount: discount || "",
      availableOffers: availableOffers || "",
      highlights: highlights || "",
      images: imageUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("[v0] Product created successfully with ID:", docRef.id)
    return NextResponse.json({ message: "Product created successfully", id: docRef.id }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      code: (error as any)?.code,
    })

    if ((error as any)?.code === "permission-denied") {
      return NextResponse.json(
        {
          error: "Permission denied",
          details:
            "Firestore security rules are blocking this operation. Please configure Firestore rules to allow write access.",
          suggestion: "Go to Firebase Console → Firestore Database → Rules and update security rules to allow writes.",
          firestoreRulesExample: `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
          `,
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
