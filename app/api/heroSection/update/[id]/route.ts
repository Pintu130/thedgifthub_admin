import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore"
import { deleteObject, ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "@/lib/firebase"

export async function PUT(
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
    const formData = await request.formData()
    const heroDataString = formData.get('heroData') as string
    const heroData = JSON.parse(heroDataString)
    const title = heroData.title
    const subtitle = heroData.subtitle
    const link = heroData.link
    const status = heroData.status
    const image = formData.get('image') as File
    const imagesToDelete = formData.get('imagesToDelete') as string
    
    // Validation
    if (!title || !subtitle || !link || !status) {
      return NextResponse.json(
        { error: "Missing required fields: title, subtitle, link, status" },
        { status: 400 }
      )
    }
    
    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be either "active" or "inactive"' },
        { status: 400 }
      )
    }
    
    const db = getFirestore(app)
    const storage = getStorage(app)
    const docRef = doc(db, "heroSection", id)
    
    // Get existing document
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Hero section item not found" },
        { status: 404 }
      )
    }
    
    const existingData = docSnap.data()
    let imageUrl = existingData.image
    
    // Delete old image if new image is uploaded
    if (image && image instanceof File && existingData.image) {
      try {
        const oldImageRef = ref(storage, existingData.image)
        await deleteObject(oldImageRef)
        console.log('Deleted old image:', existingData.image)
      } catch (error) {
        console.warn('Failed to delete old image:', error)
      }
    }
    
    // Upload new image if provided
    if (image && image instanceof File) {
      const timestamp = Date.now()
      const fileName = `hero-${timestamp}-${image.name}`
      const storageRef = ref(storage, `heroSection/${fileName}`)
      
      const buffer = await image.arrayBuffer()
      await uploadBytes(storageRef, buffer)
      imageUrl = await getDownloadURL(storageRef)
    }
    
    // Handle multiple images to delete (if provided)
    if (imagesToDelete) {
      try {
        const imagesToDeleteArray = JSON.parse(imagesToDelete)
        for (const imageToDelete of imagesToDeleteArray) {
          try {
            const imageRef = ref(storage, imageToDelete)
            await deleteObject(imageRef)
            console.log('Deleted additional image:', imageToDelete)
          } catch (error) {
            console.warn('Failed to delete additional image:', imageToDelete)
          }
        }
      } catch (error) {
        console.warn('Failed to parse imagesToDelete:', error)
      }
    }
    
    // Update document
    await updateDoc(docRef, {
      title,
      subtitle,
      link,
      status,
      image: imageUrl,
      updatedAt: new Date()
    })
    
    console.log('HeroSection API - Updated item:', id)
    return NextResponse.json({
      id,
      title,
      subtitle,
      link,
      status,
      image: imageUrl,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error("Error updating hero section item:", error)
    return NextResponse.json(
      { error: "Failed to update hero section item", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
