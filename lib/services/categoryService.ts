import { db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp, getDoc, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface Category {
  id?: string;
  name: string;
  imageUrl: string;
  status: "active" | "inactive";
  createdAt?: any;
  updatedAt?: any;
}

const categoriesRef = collection(db, 'categories');

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any) => {
  if (!data) return data;
  
  const result = { ...data };
  
  if (data.createdAt && typeof data.createdAt.toDate === 'function') {
    result.createdAt = data.createdAt.toDate();
  }
  
  if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
    result.updatedAt = data.updatedAt.toDate();
  }
  
  return result;
};

// Get all categories (no filtering)
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const q = query(categoriesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        imageUrl: data.imageUrl,
        status: data.status || 'active',
        ...convertTimestamps(data)
      } as Category;
    });
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
};

// Get categories filtered by status only
export const getCategoriesByStatus = async (status: string): Promise<Category[]> => {
  try {
    // Simple query with only where clause to avoid compound index issues
    const q = query(categoriesRef, where('status', '==', status));
    const querySnapshot = await getDocs(q);
    
    const categories = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        imageUrl: data.imageUrl,
        status: data.status || 'active',
        ...convertTimestamps(data)
      } as Category;
    });

    // Sort manually in JavaScript since we can't use orderBy with where without compound index
    return categories.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate; // Descending order (newest first)
    });
  } catch (error) {
    console.error('Error getting categories by status:', error);
    throw error;
  }
};

// Main function that handles both filtered and unfiltered requests
export const getCategories = async (statusFilter?: string): Promise<Category[]> => {
  try {
    if (statusFilter && statusFilter !== '') {
      return await getCategoriesByStatus(statusFilter);
    } else {
      return await getAllCategories();
    }
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Get categories by category ID (keep for backward compatibility)
export const getCategoriesByCategory = async (categoryId: string): Promise<Category[]> => {
  try {
    const categoryDoc = doc(db, 'categories', categoryId);
    const docSnap = await getDoc(categoryDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return [{
        id: docSnap.id,
        name: data.name,
        imageUrl: data.imageUrl,
        status: data.status || 'active',
        ...convertTimestamps(data)
      } as Category];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting categories by category:', error);
    throw error;
  }
};

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>, imageFile: File): Promise<string> => {
  try {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    console.log('Adding category with data:', { ...category, imageUrl }); // Debug log

    // Add category to Firestore with status
    const docRef = await addDoc(categoriesRef, {
      name: category.name,
      imageUrl,
      status: category.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, category: Partial<Category>, imageFile?: File, oldImageUrl?: string): Promise<void> => {
  try {
    const categoryRef = doc(db, 'categories', id);
    const updateData: any = { 
      updatedAt: serverTimestamp() 
    };

    // Add fields that are being updated
    if (category.name) updateData.name = category.name;
    if (category.status) updateData.status = category.status;

    console.log('Updating category with data:', updateData); // Debug log

    if (imageFile) {
      // If new image is provided, upload it and update the URL
      const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      updateData.imageUrl = await getDownloadURL(storageRef);
      
      // Delete the old image if it exists
      if (oldImageUrl) {
        try {
          const oldImageRef = ref(storage, oldImageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    await updateDoc(categoryRef, updateData);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string, imageUrl: string): Promise<void> => {
  try {
    // Delete the image from storage
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef).catch(error => {
      console.error('Error deleting image:', error);
    });

    // Delete the document from Firestore
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};