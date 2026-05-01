import { NextResponse } from "next/server"
import { getProducts } from "@/lib/services/productService"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    console.log("=== Test Products API ===")
    
    // Direct Firestore test first
    if (db) {
      const directTest = await db.collection('products').limit(5).get()
      console.log("Direct Firestore test - docs found:", directTest.size)
    }
    
    const result = await getProducts({
      page: 1,
      limit: 10,
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      categoryId: "",
      status: "",
    })

    console.log("Products result:", result)

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: 1,
        limit: 10,
        total: result.meta?.total || 0,
        totalPages: result.meta?.totalPages || 0,
      },
    })
  } catch (error) {
    console.error("=== Products API Error ===")
    console.error("Error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack",
      },
      { status: 500 }
    )
  }
}
