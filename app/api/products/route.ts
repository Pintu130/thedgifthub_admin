import { NextResponse } from "next/server"
import { getProducts, createProduct } from "@/lib/services/productService"
import type { PaginationParams } from "@/lib/types/product"

// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const result = await getProducts({
      page,
      limit,
      search,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    } as PaginationParams)

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Extract text fields including categoryId
    const productData: any = {
      productName: formData.get("productName") as string,
      productPrice: Number.parseFloat(formData.get("productPrice") as string) || 0,
      originalPrice: Number.parseFloat(formData.get("originalPrice") as string) || 0,
      discountPercentage: Number.parseFloat(formData.get("discountPercentage") as string) || 0,
      categoryId: formData.get("categoryId") as string, // ✅ Added categoryId
      availableOffers: (formData.get("availableOffers") as string) || "",
      highlights: (formData.get("highlights") as string) || "",
      description: (formData.get("description") as string) || "",
      status: (formData.get("status") as string) || "inactive",
      activity: 1, // Default active
    }

    // Handle file uploads
    const imageFiles = formData.getAll("images") as File[]
    if (imageFiles && imageFiles.length > 0) {
      productData.images = imageFiles
    }

    // Basic validation
    if (!productData.productName) {
      return NextResponse.json(
        {
          success: false,
          error: "Product name is required",
        },
        { status: 400 },
      )
    }

    if (!productData.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Description is required",
        },
        { status: 400 },
      )
    }

    // ✅ Added categoryId validation
    if (!productData.categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category is required",
        },
        { status: 400 },
      )
    }

    const productId = await createProduct(productData)

    return NextResponse.json(
      {
        success: true,
        id: productId,
        message: "Product created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}