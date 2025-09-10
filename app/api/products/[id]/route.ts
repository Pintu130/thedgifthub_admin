import { NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct, uploadProductImages } from "@/lib/services/productService"

// GET /api/products/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await getProductById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
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

    // Extract text fields
    const productData: any = {
      productName: formData.get("productName") as string,
      productPrice: Number.parseFloat(formData.get("productPrice") as string) || 0,
      originalPrice: Number.parseFloat(formData.get("originalPrice") as string) || 0,
      discountPercentage: Number.parseFloat(formData.get("discountPercentage") as string) || 0,
      availableOffers: (formData.get("availableOffers") as string) || "",
      highlights: (formData.get("highlights") as string) || "",
      description: (formData.get("description") as string) || "",
      status: (formData.get("status") as string) || "inactive",
      activity: 1,
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
      const uploadedImageUrls = await uploadProductImages(newImageFiles)
      productData.images = [...existingImages, ...uploadedImageUrls]
    } else {
      productData.images = existingImages
    }

    await updateProduct(params.id, productData)

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
    const product = await getProductById(params.id)
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    await deleteProduct(params.id)

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
