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
  activity: number
  createdAt: string
  updatedAt: string
}

export interface ProductFormData extends Omit<Product, "id" | "createdAt" | "updatedAt" | "images"> {
  id?: string
  images: File[] | string[]
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
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
