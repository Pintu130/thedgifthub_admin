import { type NextRequest, NextResponse } from "next/server"
import { doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

// PUT - Update product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const formData = await request.formData()

    // Extract product data
    const name = formData.get("name") as string
    const amount = formData.get("amount") as string
    const discount = formData.get("discount") as string
    const availableOffers = formData.get("availableOffers") as string
    const highlights = formData.get("highlights") as string
    const existingImages = formData.get("existingImages") as string

    // Parse existing images
    let imageUrls: string[] = []
    if (existingImages) {
      try {
        imageUrls = JSON.parse(existingImages)
      } catch (e) {
        imageUrls = []
      }
    }

    // Extract new images
    const newImages: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("newImage") && value instanceof File) {
        newImages.push(value)
      }
    }

    // Upload new images if provided
    if (newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i]
        const timestamp = Date.now()
        const fileName = `products/${timestamp}_${i}_${image.name}`
        const storageRef = ref(storage, fileName)

        const snapshot = await uploadBytes(storageRef, image)
        const downloadURL = await getDownloadURL(snapshot.ref)
        imageUrls.push(downloadURL)
      }
    }

    // Validate image count
    if (imageUrls.length < 2 || imageUrls.length > 4) {
      return NextResponse.json({ error: "Product must have 2-4 images" }, { status: 400 })
    }

    // Update product document
    const productRef = doc(db, "products", id)
    await updateDoc(productRef, {
      name,
      amount,
      discount: discount || "",
      availableOffers: availableOffers || "",
      highlights: highlights || "",
      images: imageUrls,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ message: "Product updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get product data to access image URLs
    const productRef = doc(db, "products", id)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const productData = productSnap.data()
    const imageUrls = productData.images || []

    // Delete images from storage
    if (imageUrls.length > 0) {
      const deletePromises = imageUrls.map(async (url: string) => {
        try {
          const imageRef = ref(storage, url)
          await deleteObject(imageRef)
        } catch (error) {
          console.warn("Failed to delete image:", url, error)
        }
      })
      await Promise.all(deletePromises)
    }

    // Delete product document
    await deleteDoc(productRef)

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
