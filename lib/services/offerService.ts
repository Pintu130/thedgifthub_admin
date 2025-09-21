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
  where,
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

// Get all offers (no filtering)
const getAllOffers = async (): Promise<Offer[]> => {
  try {
    const offersRef = collection(db, "offers")
    const q = query(offersRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Offer[]
  } catch (error) {
    console.error("Error getting all offers:", error)
    throw error
  }
}

// Get offers filtered by status only
const getOffersByStatus = async (status: string): Promise<Offer[]> => {
  try {
    const offersRef = collection(db, "offers")
    const q = query(offersRef, where('status', '==', status))
    const querySnapshot = await getDocs(q)
    
    const offers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Offer[]

    // Sort manually in JavaScript since we can't use orderBy with where without compound index
    return offers.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0
      return bDate - aDate // Descending order (newest first)
    })
  } catch (error) {
    console.error("Error getting offers by status:", error)
    throw error
  }
}

// Get offers filtered by category only
const getOffersByCategory = async (categoryId: string): Promise<Offer[]> => {
  try {
    const offersRef = collection(db, "offers")
    const q = query(offersRef, where('categoryId', '==', categoryId))
    const querySnapshot = await getDocs(q)
    
    const offers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Offer[]

    // Sort manually in JavaScript since we can't use orderBy with where without compound index
    return offers.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0
      return bDate - aDate // Descending order (newest first)
    })
  } catch (error) {
    console.error("Error getting offers by category:", error)
    throw error
  }
}

// Get offers filtered by both category and status
const getOffersByCategoryAndStatus = async (categoryId: string, status: string): Promise<Offer[]> => {
  try {
    const offersRef = collection(db, "offers")
    const q = query(
      offersRef, 
      where('categoryId', '==', categoryId),
      where('status', '==', status)
    )
    const querySnapshot = await getDocs(q)
    
    const offers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Offer[]

    // Sort manually in JavaScript
    return offers.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0
      return bDate - aDate // Descending order (newest first)
    })
  } catch (error) {
    console.error("Error getting offers by category and status:", error)
    throw error
  }
}

// Main function that handles all filtering scenarios
const getOffers = async (categoryFilter?: string, statusFilter?: string): Promise<Offer[]> => {
  try {
    if (categoryFilter && statusFilter) {
      // Both filters
      return await getOffersByCategoryAndStatus(categoryFilter, statusFilter)
    } else if (categoryFilter) {
      // Category filter only
      return await getOffersByCategory(categoryFilter)
    } else if (statusFilter) {
      // Status filter only
      return await getOffersByStatus(statusFilter)
    } else {
      // No filters
      return await getAllOffers()
    }
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
  getAllOffers,
  getOffersByStatus,
  getOffersByCategory,
  getOffersByCategoryAndStatus,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  uploadImages,
  deleteImages,
}