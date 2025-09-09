import { NextResponse } from "next/server"
import { deleteOffer, getOffer } from "@/lib/services/offerService"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Attempting to delete offer with ID: ${params.id}`)
    
    // Get the offer first to get the image URLs
    const offer = await getOffer(params.id)
    
    if (!offer) {
      console.error(`Offer with ID ${params.id} not found`)
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      )
    }

    console.log(`Found offer to delete:`, {
      id: params.id,
      imageCount: Array.isArray(offer.images) ? offer.images.length : 0
    })

    // Delete the offer and its images
    await deleteOffer(params.id, Array.isArray(offer.images) ? offer.images : [])
    
    console.log(`Successfully deleted offer ${params.id}`)
    return NextResponse.json({ 
      success: true,
      message: 'Offer deleted successfully' 
    })
  } catch (error) {
    console.error("Error deleting offer:", error)
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    )
  }
}
