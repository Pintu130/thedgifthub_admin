import { NextResponse } from "next/server"
import { doc, getDoc, deleteDoc, getFirestore } from "firebase/firestore"
import { deleteObject, ref, getStorage } from "firebase/storage"
import { app } from "@/lib/firebase"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!app) {
      return NextResponse.json(
        { error: "Firebase not initialized" },
        { status: 500 }
      )
    }

    const { id } = params
    const db = getFirestore(app)
    const storage = getStorage(app)
    const docRef = doc(db, "heroSection", id)
    
    // Get existing document to delete associated image
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Hero section item not found" },
        { status: 404 }
      )
    }
    
    const existingData = docSnap.data()
    
    // Delete image from storage if it exists
    if (existingData.image) {
      try {
        const imageRef = ref(storage, existingData.image)
        await deleteObject(imageRef)
        console.log('Deleted image:', existingData.image)
      } catch (error) {
        console.warn('Failed to delete image:', error)
        // Continue with document deletion even if image deletion fails
      }
    }
    
    // Delete the document
    await deleteDoc(docRef)
    
    console.log('HeroSection API - Deleted item:', id)
    return NextResponse.json({
      message: "Hero section item deleted successfully",
      id
    })
  } catch (error) {
    console.error("Error deleting hero section item:", error)
    return NextResponse.json(
      { error: "Failed to delete hero section item", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
