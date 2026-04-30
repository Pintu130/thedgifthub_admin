import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

// DELETE /api/users/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check if Firebase Admin is initialized
    if (!adminAuth) {
      return NextResponse.json(
        { success: false, error: "Firebase Admin not initialized" },
        { status: 500 }
      )
    }

    // Delete user from Firebase Authentication
    await adminAuth.deleteUser(userId)
    console.log(`[Firebase Admin] User ${userId} deleted from Authentication`)

    return NextResponse.json({
      success: true,
      message: "User deleted from Firebase Authentication successfully",
    })
  } catch (error: any) {
    console.error("[Firebase Admin] Error deleting user from Authentication:", error)

    // Handle specific Firebase Auth errors
    if (error.code === "auth/user-not-found") {
      return NextResponse.json(
        { success: false, error: "User not found in Firebase Authentication" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user from Firebase Authentication",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
