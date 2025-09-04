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
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase"

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

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products")
    const q = query(productsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("Failed to fetch products")
  }
}

// Upload multiple images to Firebase Storage
const uploadImages = async (images: File[]): Promise<string[]> => {
  const uploadPromises = images.map(async (image, index) => {
    const timestamp = Date.now()
    const fileName = `products/${timestamp}_${index}_${image.name}`
    const storageRef = ref(storage, fileName)

    const snapshot = await uploadBytes(storageRef, image)
    return await getDownloadURL(snapshot.ref)
  })

  return await Promise.all(uploadPromises)
}

// Delete images from Firebase Storage
const deleteImages = async (imageUrls: string[]) => {
  const deletePromises = imageUrls.map(async (url) => {
    try {
      const imageRef = ref(storage, url)
      await deleteObject(imageRef)
    } catch (error) {
      console.warn("Failed to delete image:", url, error)
    }
  })

  await Promise.all(deletePromises)
}

// Create new product
export const createProduct = async (productData: Omit<Product, "id">, images: File[]): Promise<void> => {
  try {
    // Upload images first
    const imageUrls = await uploadImages(images)

    // Create product document
    const productsRef = collection(db, "products")
    await addDoc(productsRef, {
      ...productData,
      images: imageUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error("Failed to create product")
  }
}

// Update existing product
export const updateProduct = async (
  productId: string,
  productData: Omit<Product, "id">,
  newImages?: File[],
  existingImages?: string[],
): Promise<void> => {
  try {
    let imageUrls = existingImages || []

    // Upload new images if provided
    if (newImages && newImages.length > 0) {
      const newImageUrls = await uploadImages(newImages)
      imageUrls = [...imageUrls, ...newImageUrls]
    }

    // Update product document
    const productRef = doc(db, "products", productId)
    await updateDoc(productRef, {
      ...productData,
      images: imageUrls,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating product:", error)
    throw new Error("Failed to update product")
  }
}

// Delete product
export const deleteProduct = async (productId: string, imageUrls: string[]): Promise<void> => {
  try {
    // Delete images from storage
    if (imageUrls && imageUrls.length > 0) {
      await deleteImages(imageUrls)
    }

    // Delete product document
    const productRef = doc(db, "products", productId)
    await deleteDoc(productRef)
  } catch (error) {
    console.error("Error deleting product:", error)
    throw new Error("Failed to delete product")
  }
}
