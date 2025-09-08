import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "../firebase"

export interface Offer {
  id?: string
  categoryId: string
  discountType: 'percentage' | 'price'
  discountLabel: string
  priceLabel: string
  value: string
  images: string[]
  status: 'active' | 'inactive'
  availableOffers: string
  highlights: string
  createdAt?: any
  updatedAt?: any
}

// Get all offers
const getOffers = async (): Promise<Offer[]> => {
  try {
    const offersRef = collection(db, "offers")
    const q = query(offersRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Offer[]
  } catch (error) {
    console.error("Error getting offers:", error)
    throw error
  }
}

// Get single offer by ID
const getOffer = async (offerId: string): Promise<Offer | null> => {
  try {
    const offerRef = doc(db, "offers", offerId)
    const docSnap = await getDoc(offerRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Offer
  } catch (error) {
    console.error("Error getting offer:", error)
    throw error
  }
}

// Upload images to Firebase Storage
const uploadImages = async (images: File[]): Promise<string[]> => {
  try {
    const uploadPromises = images.map(async (image) => {
      const storageRef = ref(storage, `offers/${Date.now()}_${image.name}`)
      const snapshot = await uploadBytes(storageRef, image)
      return getDownloadURL(snapshot.ref)
    })
    
    return Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error uploading images:", error)
    throw error
  }
}

// Delete images from Firebase Storage
const deleteImages = async (imageUrls: string[]): Promise<void> => {
  try {
    const deletePromises = imageUrls.map(async (url) => {
      const imageRef = ref(storage, url)
      try {
        await deleteObject(imageRef)
      } catch (error) {
        console.error(`Error deleting image ${url}:`, error)
      }
    })
    
    await Promise.all(deletePromises)
  } catch (error) {
    console.error("Error deleting images:", error)
    throw error
  }
}

// Create new offer
const createOffer = async (offerData: Omit<Offer, "id">, images: File[] = []): Promise<string> => {
  try {
    // Start with existing images (if any)
    let allImageUrls = [...(offerData.images || [])]
    
    // Upload new images if any
    if (images && images.length > 0) {
      const newImageUrls = await uploadImages(images)
      allImageUrls = [...allImageUrls, ...newImageUrls]
    }
    
    const offerRef = await addDoc(collection(db, "offers"), {
      ...offerData,
      images: allImageUrls, // Combine existing and new images
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    return offerRef.id
  } catch (error) {
    console.error("Error creating offer:", error)
    // Clean up uploaded images if there was an error
    if (error instanceof Error) {
      // If we have partial uploads, we might want to clean them up here
      // But we don't have access to the uploaded URLs in this scope
    }
    throw error
  }
}

// Update existing offer
const updateOffer = async (
  offerId: string,
  offerData: Partial<Omit<Offer, "id">>,
  newImages: File[] = [],
  imagesToDelete: string[] = []
): Promise<void> => {
  try {
    const offerRef = doc(db, "offers", offerId)
    const updateData: any = {
      ...offerData,
      updatedAt: serverTimestamp(),
    }
    
    // Upload new images if any
    if (newImages.length > 0) {
      const newImageUrls = await uploadImages(newImages)
      updateData.images = [...(offerData.images || []), ...newImageUrls]
    }
    
    // Delete specified images
    if (imagesToDelete.length > 0) {
      await deleteImages(imagesToDelete)
      updateData.images = (offerData.images || []).filter(
        (url) => !imagesToDelete.includes(url)
      )
    }
    
    await updateDoc(offerRef, updateData)
  } catch (error) {
    console.error("Error updating offer:", error)
    throw error
  }
}

// Delete offer
const deleteOffer = async (offerId: string, imageUrls: string[] = []): Promise<void> => {
  try {
    // Delete associated images
    if (imageUrls.length > 0) {
      await deleteImages(imageUrls)
    }
    
    // Delete the offer document
    await deleteDoc(doc(db, "offers", offerId))
  } catch (error) {
    console.error("Error deleting offer:", error)
    throw error
  }
}

export {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  uploadImages,
  deleteImages,
}
