import { db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface Category {
  id?: string;
  name: string;
  imageUrl: string;
  createdAt?: any;
  updatedAt?: any;
}

const categoriesRef = collection(db, 'categories');

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any) => {
  if (!data) return data;
  
  // Create a new object to avoid modifying the original
  const result = { ...data };
  
  // Convert Firestore timestamps to JavaScript Date objects
  if (data.createdAt && typeof data.createdAt.toDate === 'function') {
    result.createdAt = data.createdAt.toDate();
  }
  
  if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
    result.updatedAt = data.updatedAt.toDate();
  }
  
  return result;
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(categoriesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...convertTimestamps(data)
      } as Category;
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>, imageFile: File): Promise<string> => {
  try {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // Add category to Firestore
    const docRef = await addDoc(categoriesRef, {
      ...category,
      imageUrl,
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
    const updateData: any = { ...category, updatedAt: serverTimestamp() };

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
          // Continue even if old image deletion fails
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
      // Continue with deleting the document even if image deletion fails
    });

    // Delete the document from Firestore
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
