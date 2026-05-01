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
  deleteField,
  type QueryConstraint,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import type { Product, ProductFormData, PaginationParams } from "@/lib/types/product"

const COLLECTION_NAME = "products"

// Upload multiple images to Firebase Storage
export const uploadProductImages = async (images: Array<File | string>): Promise<string[]> => {
  // Filter out any strings (already uploaded URLs)
  const filesToUpload = images.filter((img): img is File => img instanceof File)
  const existingUrls = images.filter((img): img is string => typeof img === "string")

  if (filesToUpload.length === 0) {
    // Return any existing URLs that were passed in
    return existingUrls
  }

  console.log(`Uploading ${filesToUpload.length} new images...`)

  const uploadPromises = filesToUpload.map(async (image, index) => {
    try {
      console.log(`Uploading image ${index + 1}:`, image.name)
      const timestamp = Date.now()
      const fileName = `products/${timestamp}_${image.name}`
      const storageRef = ref(storage, fileName)

      const snapshot = await uploadBytes(storageRef, image)
      console.log(`Image ${index + 1} uploaded successfully`)

      const downloadURL = await getDownloadURL(storageRef)
      console.log(`Download URL obtained for image ${index + 1}:`, downloadURL)
      return downloadURL
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error)
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
    console.error("Error uploading images:", error)
    throw error
  }
}

// Delete image from Firebase Storage
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
  }
}

// Create a new product
export const createProduct = async (productData: any): Promise<string> => {
  try {
    console.log("Starting product creation with data:", productData)

    // Upload images first
    console.log("Uploading images:", productData.images)
    const imageUrls = await uploadProductImages(productData.images)
    console.log("Images uploaded successfully:", imageUrls)

    // Upload ProductCustomiseImage if provided
    let ProductCustomiseImageUrl = ""
    if (productData.ProductCustomiseImage) {
      if (typeof productData.ProductCustomiseImage === "string") {
        ProductCustomiseImageUrl = productData.ProductCustomiseImage
      } else if (productData.ProductCustomiseImage instanceof File) {
        const timestamp = Date.now()
        const fileName = `products/customise/${timestamp}_${productData.ProductCustomiseImage.name}`
        const storageRef = ref(storage, fileName)
        await uploadBytes(storageRef, productData.ProductCustomiseImage)
        ProductCustomiseImageUrl = await getDownloadURL(storageRef)
        console.log("ProductCustomiseImage uploaded successfully:", ProductCustomiseImageUrl)
      }
    }

    const product: Omit<Product, "id"> = {
      productName: productData.productName,
      productPrice: productData.productPrice,
      originalPrice: productData.originalPrice,
      discountPercentage: productData.discountPercentage,
      categoryId: productData.categoryId, //
      images: imageUrls,
      availableOffers: productData.availableOffers,
      highlights: productData.highlights,
      description: productData.description,
      status: productData.status,
      outOfStock: productData.outOfStock || "no", //
      isBestSell: productData.isBestSell || "no", //
      isCorporateGifts: productData.isCorporateGifts || "no", //
      ProductCustomise: productData.ProductCustomise || "no", //
      ProductCustomiseImage: ProductCustomiseImageUrl || undefined,
      ProductCustomiseText: productData.ProductCustomiseText || undefined,
      slug: productData.slug || "", //
      activity: productData.activity || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Shipping details
      length: productData.length || 0,
      breadth: productData.breadth || 0,
      height: productData.height || 0,
      weight: productData.weight || 0,
      // SEO details
      metaTitle: productData.metaTitle || "",
      metaKeywords: productData.metaKeywords || "",
      metaDescription: productData.metaDescription || "",
    }

    console.log("Creating product document:", product)
    const docRef = await addDoc(collection(db, COLLECTION_NAME), product)
    console.log("Product created successfully with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error(`Failed to create product: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get products
export const getProducts = async (
  params: PaginationParams & { categoryId?: string; status?: string } = { page: 1, limit: 10 }
) => {
  try {
    const {
      page = 1,
      limit: pageLimit = 20,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      categoryId = "",
      status = "", // 
    } = params

    const constraints: QueryConstraint[] = []

    // Apply category filter
    if (categoryId) {
      constraints.push(where("categoryId", "==", categoryId))
    }

    // Apply status filter - NEW
    if (status) {
      constraints.push(where("status", "==", status))
    }

    // Add search
    if (search) {
      constraints.push(where("productName", ">=", search))
      constraints.push(where("productName", "<=", search + "\uf8ff"))
    }

    // Order by - handle multiple where clauses properly
    if (categoryId && status) {
      // If both filters are applied, order by categoryId first, then status, then sortBy
      constraints.push(orderBy("categoryId"))
      constraints.push(orderBy("status"))
      constraints.push(orderBy(sortBy, sortOrder))
    } else if (categoryId) {
      // If only category filter
      constraints.push(orderBy("categoryId"))
      constraints.push(orderBy(sortBy, sortOrder))
    } else if (status) {
      // If only status filter
      constraints.push(orderBy("status"))
      constraints.push(orderBy(sortBy, sortOrder))
    } else {
      // No filters, just sort
      constraints.push(orderBy(sortBy, sortOrder))
    }

    // Base query
    let q = query(collection(db, COLLECTION_NAME), ...constraints)

    // Pagination
    if (page > 1) {
      const offset = (page - 1) * pageLimit
      const offsetQuery = query(collection(db, COLLECTION_NAME), ...constraints, limit(offset))
      const offsetSnapshot = await getDocs(offsetQuery)
      const lastVisible = offsetSnapshot.docs[offsetSnapshot.docs.length - 1]

      if (lastVisible) {
        q = query(
          collection(db, COLLECTION_NAME),
          ...constraints,
          startAfter(lastVisible),
          limit(pageLimit)
        )
      }
    } else {
      q = query(collection(db, COLLECTION_NAME), ...constraints, limit(pageLimit))
    }

    // Fetch products
    const querySnapshot = await getDocs(q)
    const products: Product[] = []
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product)
    })

    // Total count (without pagination limit)
    const totalQuery = query(collection(db, COLLECTION_NAME), ...constraints)
    const totalSnapshot = await getDocs(totalQuery)
    const total = totalSnapshot.size

    return {
      data: products,
      meta: {
        total,
        page,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    }
  } catch (error) {
    console.error("Error getting products:", error)
    throw error
  }
}

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Product
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting product:", error)
    throw error
  }
}

// Update a product
export const updateProduct = async (id: string, productData: any): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)

    // Get the existing product to track old images
    const existingProduct = await getProductById(id)
    const oldImageUrls = existingProduct?.images || []
    const oldProductCustomiseImageUrl = existingProduct?.ProductCustomiseImage || ""

    // Handle image updates if new images are provided
    let imageUrls: string[] = []

    // Add any existing image URLs (filter out any non-string values)
    if (Array.isArray(productData.images)) {
      imageUrls = productData.images.filter((img: any): img is string => typeof img === "string")
    }

    // Handle new file uploads
    const newImageFiles = Array.isArray(productData.images)
      ? productData.images.filter((img: any): img is File => img instanceof File)
      : []

    if (newImageFiles.length > 0) {
      const newImageUrls = await uploadProductImages(newImageFiles)
      imageUrls = [...imageUrls, ...newImageUrls]
    }

    // Handle ProductCustomiseImage update
    let ProductCustomiseImageUrl = oldProductCustomiseImageUrl
    if (productData.ProductCustomiseImage) {
      if (typeof productData.ProductCustomiseImage === "string") {
        ProductCustomiseImageUrl = productData.ProductCustomiseImage
      } else if (productData.ProductCustomiseImage instanceof File) {
        // Delete old customise image if exists
        if (oldProductCustomiseImageUrl) {
          await deleteProductImage(oldProductCustomiseImageUrl).catch(console.error)
        }
        // Upload new customise image
        const timestamp = Date.now()
        const fileName = `products/customise/${timestamp}_${productData.ProductCustomiseImage.name}`
        const storageRef = ref(storage, fileName)
        await uploadBytes(storageRef, productData.ProductCustomiseImage)
        ProductCustomiseImageUrl = await getDownloadURL(storageRef)
        console.log("ProductCustomiseImage uploaded successfully:", ProductCustomiseImageUrl)
      }
    } else if (productData.ProductCustomiseImage === null || productData.ProductCustomiseImage === "") {
      // If ProductCustomiseImage is explicitly null/empty, delete old image
      if (oldProductCustomiseImageUrl) {
        await deleteProductImage(oldProductCustomiseImageUrl).catch(console.error)
      }
      ProductCustomiseImageUrl = ""
    }

    const updateData: any = {
      productName: productData.productName,
      productPrice: productData.productPrice,
      originalPrice: productData.originalPrice,
      discountPercentage: productData.discountPercentage,
      categoryId: productData.categoryId, //
      availableOffers: productData.availableOffers,
      highlights: productData.highlights,
      description: productData.description,
      status: productData.status,
      outOfStock: productData.outOfStock || "no", //
      isBestSell: productData.isBestSell || "no", //
      isCorporateGifts: productData.isCorporateGifts || "no", //
      ProductCustomise: productData.ProductCustomise || "no", //
      slug: productData.slug || "", //
      activity: productData.activity || 1,
      images: imageUrls,
      updatedAt: new Date().toISOString(),
      // Shipping details
      length: productData.length || 0,
      breadth: productData.breadth || 0,
      height: productData.height || 0,
      weight: productData.weight || 0,
      // SEO details
      metaTitle: productData.metaTitle || "",
      metaKeywords: productData.metaKeywords || "",
      metaDescription: productData.metaDescription || "",
    }

    // Handle ProductCustomiseImage and ProductCustomiseText based on ProductCustomise value
    if (productData.ProductCustomise === "yes") {
      // Only add these fields if ProductCustomise is "yes"
      if (ProductCustomiseImageUrl) {
        updateData.ProductCustomiseImage = ProductCustomiseImageUrl
      }
      if (productData.ProductCustomiseText) {
        updateData.ProductCustomiseText = productData.ProductCustomiseText
      }
    } else {
      // ProductCustomise is "no" - use deleteField to remove from Firestore
      updateData.ProductCustomiseImage = deleteField()
      updateData.ProductCustomiseText = deleteField()
    }

    console.log("Updating product with data:111", updateData) //

    // Update the product in Firestore
    await updateDoc(docRef, updateData)

    // Clean up old images that are no longer needed
    const imagesToDelete = oldImageUrls.filter((url) => !imageUrls.includes(url))
    if (imagesToDelete.length > 0) {
      console.log(`Cleaning up ${imagesToDelete.length} old images`)
      await Promise.all(imagesToDelete.map((url) => deleteProductImage(url).catch(console.error)))
    }
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // First get the product to delete its images
    const product = await getProductById(id)
    if (product) {
      // Delete all images from storage
      if (product.images) {
        await Promise.all(product.images.map((imageUrl) => deleteProductImage(imageUrl)))
      }
      // Delete ProductCustomiseImage from storage
      if (product.ProductCustomiseImage) {
        await deleteProductImage(product.ProductCustomiseImage).catch(console.error)
      }
    }

    // Delete the document
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// Toggle product activity status
export const toggleProductActivity = async (id: string, activity: number): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      activity,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error toggling product activity:", error)
    throw error
  }
}