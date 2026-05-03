/**
 * Server-only product Firestore/Storage via Firebase Admin (API routes).
 */
import { FieldValue } from "firebase-admin/firestore"
import type { CollectionReference, DocumentData, Query } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { uploadFileToAdminBucket, deleteFileFromAdminBucketByUrl } from "@/lib/admin/storage"
import type { Product, PaginationParams } from "@/lib/types/product"

const COLLECTION_NAME = "products"
const SORT_WHITELIST = new Set(["createdAt", "updatedAt", "productName", "productPrice"])

function docToProduct(id: string, data: DocumentData): Product {
  const raw: Record<string, unknown> = { id, ...data }
  for (const key of Object.keys(raw)) {
    const v = raw[key]
    if (
      v != null &&
      typeof v === "object" &&
      "toDate" in v &&
      typeof (v as { toDate: () => Date }).toDate === "function"
    ) {
      try {
        raw[key] = (v as { toDate: () => Date }).toDate().toISOString()
      } catch {
        /* noop */
      }
    }
  }
  return raw as unknown as Product
}

function orderedProductQuery(
  coll: CollectionReference<DocumentData>,
  args: {
    categoryId: string
    status: string
    search: string
    sortBy: string
    sortOrder: "asc" | "desc"
  },
): Query<DocumentData> {
  const { categoryId, status, search, sortBy, sortOrder } = args
  const sortField = SORT_WHITELIST.has(sortBy) ? sortBy : "createdAt"
  let q: Query<DocumentData> = coll

  if (categoryId) q = q.where("categoryId", "==", categoryId)
  if (status) q = q.where("status", "==", status)
  if (search) {
    q = q.where("productName", ">=", search).where("productName", "<=", search + "\uf8ff")
  }

  if (categoryId && status) {
    return q.orderBy("categoryId").orderBy("status").orderBy(sortField, sortOrder)
  }
  if (categoryId) {
    return q.orderBy("categoryId").orderBy(sortField, sortOrder)
  }
  if (status) {
    return q.orderBy("status").orderBy(sortField, sortOrder)
  }
  return q.orderBy(sortField, sortOrder)
}

export const getProducts = async (
  params: PaginationParams & { categoryId?: string; status?: string } = { page: 1, limit: 10 },
) => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const {
    page = 1,
    limit: pageLimit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    categoryId = "",
    status = "",
  } = params

  const coll = adminDb.collection(COLLECTION_NAME)
  const constraintArgs = { categoryId, status, search, sortBy, sortOrder }

  const cref = coll as CollectionReference<DocumentData>

  let q: Query<DocumentData>
  if (page > 1) {
    const offset = (page - 1) * pageLimit
    const offsetSnapshot = await orderedProductQuery(cref, constraintArgs).limit(offset).get()
    const lastVisible = offsetSnapshot.docs[offsetSnapshot.docs.length - 1]
    if (!lastVisible) {
      const totalEarly = await orderedProductQuery(cref, constraintArgs).get()
      const t = totalEarly.size
      return {
        data: [],
        meta: {
          total: t,
          page,
          limit: pageLimit,
          totalPages: Math.ceil(t / pageLimit),
        },
      }
    }
    q = orderedProductQuery(cref, constraintArgs).startAfter(lastVisible).limit(pageLimit)
  } else {
    q = orderedProductQuery(cref, constraintArgs).limit(pageLimit)
  }

  const querySnapshot = await q.get()
  const products = querySnapshot.docs.map((d) => docToProduct(d.id, d.data()))

  const totalSnapshot = await orderedProductQuery(cref, constraintArgs).get()
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
}

export const getProductById = async (id: string): Promise<Product | null> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const docSnap = await adminDb.collection(COLLECTION_NAME).doc(id).get()
  if (!docSnap.exists) return null
  return docToProduct(docSnap.id, docSnap.data()!)
}

export const uploadProductImages = async (images: File[]): Promise<string[]> => {
  return Promise.all(images.map((image) => uploadFileToAdminBucket(image, "products")))
}

export const createProduct = async (productData: any): Promise<string> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  console.log("[admin] Creating product...")
  let imageUrls: string[] = []
  if (productData.images?.length) {
    imageUrls = await uploadProductImages(productData.images)
  }

  let ProductCustomiseImageUrl = ""
  if (productData.ProductCustomiseImage) {
    if (typeof productData.ProductCustomiseImage === "string") {
      ProductCustomiseImageUrl = productData.ProductCustomiseImage
    } else if (productData.ProductCustomiseImage instanceof File) {
      ProductCustomiseImageUrl = await uploadFileToAdminBucket(
        productData.ProductCustomiseImage,
        "products/customise",
      )
    }
  }

  const product: Record<string, unknown> = {
    productName: productData.productName,
    productPrice: productData.productPrice,
    originalPrice: productData.originalPrice,
    discountPercentage: productData.discountPercentage,
    categoryId: productData.categoryId,
    images: imageUrls,
    availableOffers: productData.availableOffers,
    highlights: productData.highlights,
    description: productData.description,
    status: productData.status,
    outOfStock: productData.outOfStock || "no",
    isBestSell: productData.isBestSell || "no",
    isCorporateGifts: productData.isCorporateGifts || "no",
    ProductCustomise: productData.ProductCustomise || "no",
    slug: productData.slug || "",
    activity: productData.activity || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    length: productData.length || 0,
    breadth: productData.breadth || 0,
    height: productData.height || 0,
    weight: productData.weight || 0,
    metaTitle: productData.metaTitle || "",
    metaKeywords: productData.metaKeywords || "",
    metaDescription: productData.metaDescription || "",
  }

  // Firestore (Admin SDK) rejects undefined values — only set customise fields when "yes".
  if (productData.ProductCustomise === "yes") {
    if (ProductCustomiseImageUrl) {
      product.ProductCustomiseImage = ProductCustomiseImageUrl
    }
    if (productData.ProductCustomiseText) {
      product.ProductCustomiseText = productData.ProductCustomiseText
    }
  }

  const docRef = await adminDb.collection(COLLECTION_NAME).add(product)

  return docRef.id
}

export const updateProduct = async (id: string, productData: any): Promise<void> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const docRef = adminDb.collection(COLLECTION_NAME).doc(id)

  const existingProduct = await getProductById(id)
  const oldImageUrls = existingProduct?.images || []
  const oldProductCustomiseImageUrl = existingProduct?.ProductCustomiseImage || ""

  let imageUrls: string[] = []
  if (Array.isArray(productData.images)) {
    imageUrls = productData.images.filter((img: unknown): img is string => typeof img === "string")
  }

  const newImageFiles = Array.isArray(productData.images)
    ? productData.images.filter((img: unknown): img is File => img instanceof File)
    : []

  if (newImageFiles.length > 0) {
    const newImageUrls = await uploadProductImages(newImageFiles)
    imageUrls = [...imageUrls, ...newImageUrls]
  }

  let ProductCustomiseImageUrl = oldProductCustomiseImageUrl
  if (productData.ProductCustomiseImage) {
    if (typeof productData.ProductCustomiseImage === "string") {
      ProductCustomiseImageUrl = productData.ProductCustomiseImage
    } else if (productData.ProductCustomiseImage instanceof File) {
      if (oldProductCustomiseImageUrl) {
        await deleteFileFromAdminBucketByUrl(oldProductCustomiseImageUrl)
      }
      ProductCustomiseImageUrl = await uploadFileToAdminBucket(
        productData.ProductCustomiseImage,
        "products/customise",
      )
    }
  } else if (productData.ProductCustomiseImage === null || productData.ProductCustomiseImage === "") {
    if (oldProductCustomiseImageUrl) {
      await deleteFileFromAdminBucketByUrl(oldProductCustomiseImageUrl)
    }
    ProductCustomiseImageUrl = ""
  }

  const updateData: Record<string, unknown> = {
    productName: productData.productName,
    productPrice: productData.productPrice,
    originalPrice: productData.originalPrice,
    discountPercentage: productData.discountPercentage,
    categoryId: productData.categoryId,
    availableOffers: productData.availableOffers,
    highlights: productData.highlights,
    description: productData.description,
    status: productData.status,
    outOfStock: productData.outOfStock || "no",
    isBestSell: productData.isBestSell || "no",
    isCorporateGifts: productData.isCorporateGifts || "no",
    ProductCustomise: productData.ProductCustomise || "no",
    slug: productData.slug || "",
    activity: productData.activity || 1,
    images: imageUrls,
    updatedAt: new Date().toISOString(),
    length: productData.length || 0,
    breadth: productData.breadth || 0,
    height: productData.height || 0,
    weight: productData.weight || 0,
    metaTitle: productData.metaTitle || "",
    metaKeywords: productData.metaKeywords || "",
    metaDescription: productData.metaDescription || "",
  }

  if (productData.ProductCustomise === "yes") {
    if (ProductCustomiseImageUrl) {
      updateData.ProductCustomiseImage = ProductCustomiseImageUrl
    }
    if (productData.ProductCustomiseText) {
      updateData.ProductCustomiseText = productData.ProductCustomiseText
    }
  } else {
    updateData.ProductCustomiseImage = FieldValue.delete()
    updateData.ProductCustomiseText = FieldValue.delete()
  }

  await docRef.update(updateData)

  const imagesToDelete = oldImageUrls.filter((url) => !imageUrls.includes(url))
  if (imagesToDelete.length > 0) {
    await Promise.all(imagesToDelete.map((url) => deleteFileFromAdminBucketByUrl(url)))
  }
}

export const deleteProduct = async (id: string): Promise<void> => {
  if (!adminDb) throw new Error("Firebase Admin Firestore not initialized.")

  const product = await getProductById(id)
  if (product?.images?.length) {
    await Promise.all(product.images.map((url) => deleteFileFromAdminBucketByUrl(url)))
  }
  if (product?.ProductCustomiseImage) {
    await deleteFileFromAdminBucketByUrl(product.ProductCustomiseImage)
  }

  await adminDb.collection(COLLECTION_NAME).doc(id).delete()
}