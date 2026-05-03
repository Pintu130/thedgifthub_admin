/**
 * Categories via Firebase Admin (API routes).
 */
import { FieldValue } from "firebase-admin/firestore"
import type { DocumentData } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { uploadFileToAdminBucket, deleteFileFromAdminBucketByUrl } from "@/lib/admin/storage"

/** Same shape as `categoryService` Category (kept local to avoid importing client module). */
interface Category {
  id?: string
  name: string
  imageUrl: string
  status: "active" | "inactive"
  isPublic: boolean
  createdAt?: unknown
  updatedAt?: unknown
}

const COLL = "categories"

function catFromDoc(id: string, data: DocumentData): Category {
  const createdRaw = data.createdAt
  const updatedRaw = data.updatedAt

  let createdAt: Date | unknown = createdRaw
  let updatedAt: Date | unknown = updatedRaw

  if (
    createdRaw &&
    typeof createdRaw === "object" &&
    "toDate" in createdRaw &&
    typeof (createdRaw as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      createdAt = (createdRaw as { toDate: () => Date }).toDate()
    } catch {
      /* keep */
    }
  }
  if (
    updatedRaw &&
    typeof updatedRaw === "object" &&
    "toDate" in updatedRaw &&
    typeof (updatedRaw as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      updatedAt = (updatedRaw as { toDate: () => Date }).toDate()
    } catch {
      /* keep */
    }
  }

  return {
    id,
    name: data.name as string,
    imageUrl: data.imageUrl as string,
    status: data.status === "inactive" ? "inactive" : "active",
    isPublic: Boolean(data.isPublic),
    createdAt,
    updatedAt,
  }
}

export const getAllCategories = async (): Promise<Category[]> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const snap = await adminDb.collection(COLL).orderBy("createdAt", "desc").get()
  return snap.docs.map((d) => catFromDoc(d.id, d.data()))
}

export const getCategoriesByStatus = async (status: string): Promise<Category[]> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const snap = await adminDb.collection(COLL).where("status", "==", status).get()
  const list = snap.docs.map((d) => catFromDoc(d.id, d.data()))
  return list.sort((a, b) => {
    const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(String(a.createdAt)).getTime() || 0
    const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(String(b.createdAt)).getTime() || 0
    return bDate - aDate
  })
}

export const getCategoriesByCategory = async (categoryId: string): Promise<Category[]> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const docSnap = await adminDb.collection(COLL).doc(categoryId).get()
  if (!docSnap.exists) return []
  const data = docSnap.data()!
  return [
    catFromDoc(docSnap.id, data),
  ]
}

export const addCategory = async (
  category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  imageFile: File,
): Promise<string> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const imageUrl = await uploadFileToAdminBucket(imageFile, "categories")

  const docRef = await adminDb.collection(COLL).add({
    name: category.name,
    imageUrl,
    status: category.status || "active",
    isPublic: category.isPublic ?? false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return docRef.id
}

export const updateCategory = async (
  id: string,
  category: Partial<Category>,
  imageFile?: File,
  oldImageUrl?: string,
): Promise<void> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const updatePayload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (category.name) updatePayload.name = category.name
  if (category.status) updatePayload.status = category.status
  if (category.isPublic !== undefined) updatePayload.isPublic = category.isPublic

  if (imageFile) {
    updatePayload.imageUrl = await uploadFileToAdminBucket(imageFile, "categories")
    if (oldImageUrl) {
      await deleteFileFromAdminBucketByUrl(oldImageUrl)
    }
  }

  await adminDb.collection(COLL).doc(id).update(updatePayload)
}

export const deleteCategory = async (id: string, imageUrl: string): Promise<void> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  await deleteFileFromAdminBucketByUrl(imageUrl)
  await adminDb.collection(COLL).doc(id).delete()
}
