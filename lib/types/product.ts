export interface Product {
  id?: string;
  productName: string;
  productPrice: number;
  originalPrice: number; // Price above $106.65
  discountPercentage: number; // Percentage off
  images: string[]; // Multiple image URLs
  availableOffers: string; // CKEditor content
  highlights: string; // CKEditor content
  activity: number; // 0 or 1 for active/inactive
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  id?: string;
  productName: string;
  productPrice: number;
  originalPrice: number;
  discountPercentage: number;
  images: File[]; // For form submission
  imageUrls: string[]; // For display
  availableOffers: string;
  highlights: string;
  activity: number;
}

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProductResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
