export interface Product {
  id?: string
  productName: string
  productPrice: number
  categoryId: string
  originalPrice: number
  discountPercentage: number
  images: string[]
  availableOffers: string
  highlights: string
  description: string
  status: "active" | "inactive"
  outOfStock: string
  isBestSell: string
  isCorporateGifts: string
  ProductCustomise: string
  ProductCustomiseImage?: string
  ProductCustomiseText?: string
  activity: number
  createdAt: string
  updatedAt: string
  slug: string
  // Shipping details
  length?: number
  breadth?: number
  height?: number
  weight?: number
  // SEO details
  metaTitle?: string
  metaKeywords?: string
  metaDescription?: string
}

export interface ProductFormData {
  id?: string
  name: string
  amount: string
  discount: string
  originalPrice: string
  availableOffers: string
  highlights: string
  description: string
  status: "active" | "inactive"
  outOfStock: string
  isBestSell: string
  isCorporateGifts: string
  ProductCustomise: string
  ProductCustomiseImage?: File | string
  ProductCustomiseText?: string
  ProductCustomiseImagePreview?: string
  images: Array<File | string>
  imagesPreviews: string[]
  productPrice: number
  discountPercentage: number
  slug: string
  categoryId?: string
  // Shipping details
  length?: string
  breadth?: string
  height?: string
  weight?: string
  // SEO details
  metaTitle?: string
  metaKeywords?: string
  metaDescription?: string
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  categoryId?: string   // 👈 added so no error
}

export interface ProductsResponse {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
