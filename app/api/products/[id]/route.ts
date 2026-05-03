import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import * as productAdmin from "@/lib/services/productServiceAdmin"
import * as productClient from "@/lib/services/productService"

const productApi = adminDb ? productAdmin : productClient

export const dynamic = "force-dynamic"

// GET /api/products/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await productApi.getProductById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "private, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PATCH /api/products/[id]
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()

    // Extract text fields including categoryId
    const productData: any = {
      productName: formData.get("productName") as string,
      productPrice: Number.parseFloat(formData.get("productPrice") as string) || 0,
      originalPrice: Number.parseFloat(formData.get("originalPrice") as string) || 0,
      discountPercentage: Number.parseFloat(formData.get("discountPercentage") as string) || 0,
      categoryId: formData.get("categoryId") as string, // 
      availableOffers: (formData.get("availableOffers") as string) || "",
      highlights: (formData.get("highlights") as string) || "",
      description: (formData.get("description") as string) || "",
      status: (formData.get("status") as string) || "inactive",
      outOfStock: (formData.get("outOfStock") as string) || "no", // Added outOfStock field
      isBestSell: (formData.get("isBestSell") as string) || "no", // Added isBestSell field
      isCorporateGifts: (formData.get("isCorporateGifts") as string) || "no", // Added isCorporateGifts field
      ProductCustomise: (formData.get("ProductCustomise") as string) || "no", // Added ProductCustomise field
      ProductCustomiseText: (formData.get("ProductCustomiseText") as string) || "", // Added ProductCustomiseText field
      slug: (formData.get("slug") as string) || "", // Added slug field
      activity: 1,
      // Shipping details
      length: Number.parseFloat(formData.get("length") as string) || 0,
      breadth: Number.parseFloat(formData.get("breadth") as string) || 0,
      height: Number.parseFloat(formData.get("height") as string) || 0,
      weight: Number.parseFloat(formData.get("weight") as string) || 0,
      // SEO details
      metaTitle: (formData.get("metaTitle") as string) || "",
      metaKeywords: (formData.get("metaKeywords") as string) || "",
      metaDescription: (formData.get("metaDescription") as string) || "",
    }

    // Handle images
    const imageInputs = formData.getAll("images")
    const existingImages: string[] = []
    const newImageFiles: File[] = []

    // Separate existing URLs from new files
    imageInputs.forEach((item) => {
      if (typeof item === "string") {
        existingImages.push(item)
      } else if (item instanceof File) {
        newImageFiles.push(item)
      }
    })

    // Only process if there are new files to upload
    if (newImageFiles.length > 0) {
      // Upload new images and get their URLs
      const uploadedImageUrls = await productApi.uploadProductImages(newImageFiles)
      productData.images = [...existingImages, ...uploadedImageUrls]
    } else {
      productData.images = existingImages
    }

    // Handle ProductCustomiseImage
    const ProductCustomiseImageInput = formData.get("ProductCustomiseImage")
    if (ProductCustomiseImageInput !== null) {
      if (typeof ProductCustomiseImageInput === "string") {
        // Existing image URL or empty string (for deletion)
        productData.ProductCustomiseImage = ProductCustomiseImageInput
      } else if (ProductCustomiseImageInput instanceof File && ProductCustomiseImageInput.size > 0) {
        // New file to upload
        productData.ProductCustomiseImage = ProductCustomiseImageInput
      }
    } else {
      // Explicitly set to empty string for deletion when field is missing
      productData.ProductCustomiseImage = ""
    }

    await productApi.updateProduct(params.id, productData)

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/products/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await productApi.getProductById(params.id)
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    await productApi.deleteProduct(params.id)

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}