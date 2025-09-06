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
  DocumentSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Product, ProductFormData, PaginationParams } from "@/lib/types/product";

const COLLECTION_NAME = "products";

// Upload multiple images to Firebase Storage
export const uploadProductImages = async (images: Array<File | string>): Promise<string[]> => {
  // Filter out any strings (already uploaded URLs)
  const filesToUpload = images.filter((img): img is File => img instanceof File);
  const existingUrls = images.filter((img): img is string => typeof img === 'string');
  
  if (filesToUpload.length === 0) {
    // Return any existing URLs that were passed in
    return existingUrls;
  }

  console.log(`Uploading ${filesToUpload.length} new images...`);
  
  const uploadPromises = filesToUpload.map(async (image, index) => {
    try {
      console.log(`Uploading image ${index + 1}:`, image.name);
      const timestamp = Date.now();
      const fileName = `products/${timestamp}_${image.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, image);
      console.log(`Image ${index + 1} uploaded successfully`);
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`Download URL obtained for image ${index + 1}:`, downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error);
      throw new Error(`Failed to upload image ${image.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  try {
    const newImageUrls = await Promise.all(uploadPromises);
    // Return both existing URLs and new ones
    return [...existingUrls, ...newImageUrls];
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

// Create a new product
export const createProduct = async (productData: ProductFormData): Promise<string> => {
  try {
    console.log("Starting product creation with data:", productData);
    
    // Upload images first
    console.log("Uploading images:", productData.images);
    const imageUrls = await uploadProductImages(productData.images);
    console.log("Images uploaded successfully:", imageUrls);
    
    const product: Omit<Product, 'id'> = {
      productName: productData.productName,
      productPrice: productData.productPrice,
      originalPrice: productData.originalPrice,
      discountPercentage: productData.discountPercentage,
      images: imageUrls,
      availableOffers: productData.availableOffers,
      highlights: productData.highlights,
      activity: productData.activity || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Creating product document:", product);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), product);
    console.log("Product created successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get all products with pagination and search
export const getProducts = async (params: PaginationParams = { page: 1, limit: 10 }) => {
  try {
    const {
      page = 1,
      limit: pageLimit = 20,
      search = "",
    } = params;

    const constraints: QueryConstraint[] = [
      orderBy("createdAt", "desc"),
    ];

    // Add search constraint if provided
    if (search) {
      constraints.push(
        where("productName", ">=", search),
        where("productName", "<=", search + "\uf8ff")
      );
    }

    // Create query
    let q = query(collection(db, COLLECTION_NAME), ...constraints);

    // Apply pagination
    if (page > 1) {
      const offset = (page - 1) * pageLimit;
      const offsetQuery = query(
        collection(db, COLLECTION_NAME),
        ...constraints,
        limit(offset)
      );
      const offsetSnapshot = await getDocs(offsetQuery);
      const lastVisible = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
      
      if (lastVisible) {
        q = query(
          collection(db, COLLECTION_NAME),
          ...constraints,
          startAfter(lastVisible),
          limit(pageLimit)
        );
      }
    } else {
      q = query(collection(db, COLLECTION_NAME), ...constraints, limit(pageLimit));
    }

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    // Get total count for pagination
    const totalQuery = query(collection(db, COLLECTION_NAME), ...constraints);
    const totalSnapshot = await getDocs(totalQuery);
    const total = totalSnapshot.size;

    return {
      data: products,
      meta: {
        total,
        page,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    };
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (
  id: string,
  productData: Partial<ProductFormData>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // Get the existing product to track old images
    const existingProduct = await getProductById(id);
    const oldImageUrls = existingProduct?.images || [];
    
    // Handle image updates if new images are provided
    let imageUrls: string[] = [];
    
    // Add any existing image URLs (filter out any non-string values)
    if (Array.isArray(productData.images)) {
      imageUrls = productData.images.filter((img): img is string => typeof img === 'string');
    }
    
    // Handle new file uploads
    const newImageFiles = Array.isArray(productData.images) 
      ? productData.images.filter((img): img is File => img instanceof File)
      : [];
      
    if (newImageFiles.length > 0) {
      const newImageUrls = await uploadProductImages(newImageFiles);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    const updateData: Partial<Product> = {
      ...productData,
      images: imageUrls,
      updatedAt: new Date().toISOString(),
    };

    // Remove form-specific fields
    delete (updateData as any).imageUrls;
    delete (updateData as any).images;
    updateData.images = imageUrls;

    // Update the product in Firestore
    await updateDoc(docRef, updateData);
    
    // Clean up old images that are no longer needed
    const imagesToDelete = oldImageUrls.filter(url => !imageUrls.includes(url));
    if (imagesToDelete.length > 0) {
      console.log(`Cleaning up ${imagesToDelete.length} old images`);
      await Promise.all(
        imagesToDelete.map(url => deleteProductImage(url).catch(console.error))
      );
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // First get the product to delete its images
    const product = await getProductById(id);
    
    if (product && product.images) {
      // Delete all images from storage
      await Promise.all(
        product.images.map((imageUrl) => deleteProductImage(imageUrl))
      );
    }

    // Delete the document
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Toggle product activity status
export const toggleProductActivity = async (id: string, activity: number): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      activity,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error toggling product activity:", error);
    throw error;
  }
};
