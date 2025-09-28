import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getDoc,
  type QueryConstraint,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

// Define the User interface locally to avoid import issues
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: string
  dob?: string
  orderCount?: number
  lastOrderDate?: string
  wishlistCount?: number
  supportRequestCount?: number
  activityStatus?: string
  notes?: string
  image?: string[]
  addressType?: string
  pincode?: string
  state?: string
  houseNo?: string
  roadName?: string
  landmark?: string
  createdAt?: any
  updatedAt?: any
}

const COLLECTION_NAME = "users"

// Upload customer images to Firebase Storage
export const uploadCustomerImages = async (images: (string | File)[]): Promise<string[]> => {
  // Filter out any strings (already uploaded URLs)
  const filesToUpload = images.filter((img): img is File => img instanceof File)
  const existingUrls = images.filter((img): img is string => typeof img === "string")

  if (filesToUpload.length === 0) {
    // Return any existing URLs that were passed in
    return existingUrls
  }

  console.log(`Uploading ${filesToUpload.length} new customer images...`)

  const uploadPromises = filesToUpload.map(async (image, index) => {
    try {
      console.log(`Uploading customer image ${index + 1}:`, image.name)
      const timestamp = Date.now()
      const fileName = `customers/${timestamp}_${image.name}`
      const storageRef = ref(storage, fileName)

      const snapshot = await uploadBytes(storageRef, image)
      console.log(`Customer image ${index + 1} uploaded successfully`)

      const downloadURL = await getDownloadURL(storageRef)
      console.log(`Download URL obtained for customer image ${index + 1}:`, downloadURL)
      return downloadURL
    } catch (error) {
      console.error(`Error uploading customer image ${index + 1}:`, error)
      throw new Error(
        `Failed to upload image ${image.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  })

  try {
    const newImageUrls = await Promise.all(uploadPromises)
    // Return both existing URLs and new ones
    return [...existingUrls, ...newImageUrls]
  } catch (error) {
    console.error("Error uploading customer images:", error)
    throw error
  }
}

// Delete image from Firebase Storage
export const deleteCustomerImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the Firebase Storage URL
    // Firebase Storage URLs have the format:
    // https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]
    const decodedUrl = decodeURIComponent(imageUrl)
    const pathRegex = /\/o\/(.+?)(\?|$)/
    const match = decodedUrl.match(pathRegex)
    
    if (match && match[1]) {
      const filePath = match[1]
      const imageRef = ref(storage, filePath)
      await deleteObject(imageRef)
      console.log(`Successfully deleted customer image: ${filePath}`)
    } else {
      console.warn("Could not extract file path from URL for deletion:", imageUrl)
    }
  } catch (error) {
    console.error("Error deleting customer image:", error)
  }
}

// Get a single user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        gender: data.gender || "",
        dob: data.dob || "",
        image: data.image || [],
        addressType: data.addressType || "",
        pincode: data.pincode || "",
        state: data.state || "",
        houseNo: data.houseNo || "",
        roadName: data.roadName || "",
        landmark: data.landmark || "",
        orderCount: data.orderCount ?? 0,
        lastOrderDate: data.lastOrderDate ?? "",
        wishlistCount: data.wishlistCount ?? 0,
        supportRequestCount: data.supportRequestCount ?? 0,
        activityStatus: data.activityStatus || "inactive",
        notes: data.notes || "",
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
      } as User
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

// Update a user
export const updateUser = async (id: string, userData: Partial<User>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)

    // Get the existing user to track old images
    const existingUser = await getUserById(id)
    const oldImageUrls = existingUser?.image || []

    // Handle image updates if new images are provided
    let imageUrls: string[] = []

    // Add any existing image URLs (filter out any non-string values)
    if (Array.isArray(userData.image)) {
      imageUrls = userData.image.filter((img: any): img is string => typeof img === "string")
    }

    // Handle new file uploads
    const newImageFiles = Array.isArray(userData.image)
      ? userData.image.filter((img: any): img is File => img instanceof File)
      : []

    if (newImageFiles.length > 0) {
      const newImageUrls = await uploadCustomerImages(newImageFiles)
      imageUrls = [...imageUrls, ...newImageUrls]
    }

    const updateData: Partial<User> = {
      ...userData,
      image: imageUrls,
      updatedAt: new Date().toISOString(),
    }

    // Remove form-specific fields
    delete (updateData as any).imageUrls
    delete (updateData as any).image
    updateData.image = imageUrls

    console.log("Updating user with data:", updateData)

    // Update the user in Firestore
    await updateDoc(docRef, updateData)

    // Clean up old images that are no longer needed
    const imagesToDelete = oldImageUrls.filter((url: string) => !imageUrls.includes(url))
    if (imagesToDelete.length > 0) {
      console.log(`Cleaning up ${imagesToDelete.length} old customer images`)
      await Promise.all(imagesToDelete.map((url: string) => deleteCustomerImage(url).catch(console.error)))
    }
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Delete a user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    // First get the user to delete its images
    const user = await getUserById(id)
    if (user && user.image) {
      // Delete all images from storage
      await Promise.all(user.image.map((imageUrl: string) => deleteCustomerImage(imageUrl)))
    }

    // Delete the document
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}