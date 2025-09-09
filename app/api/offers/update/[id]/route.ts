import { NextResponse } from "next/server"
import { updateOffer } from "@/lib/services/offerService"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the ID is provided
    if (!params.id) {
      throw new Error('Offer ID is required')
    }
    
    const formData = await request.formData()
    console.log('Received form data keys:', [...formData.keys()])
    
    // Get the offer data
    const offerDataStr = formData.get('offerData') as string
    if (!offerDataStr) {
      throw new Error('No offer data provided')
    }
    
    const offerData = JSON.parse(offerDataStr)
    console.log('Parsed offer data:', offerData)
    
    // Get images to delete
    const imagesToDeleteStr = formData.get('imagesToDelete') as string | null
    const imagesToDelete = imagesToDeleteStr ? JSON.parse(imagesToDeleteStr) : []
    console.log('Images to delete:', imagesToDelete)
    
    // Get new images
    const newImages: File[] = []
    const newImagesData = formData.getAll('newImages')
    
    for (const item of newImagesData) {
      if (item instanceof File) {
        newImages.push(item)
      }
    }
    
    console.log(`Found ${newImages.length} new images to upload`)
    
    // Make sure we're not including the ID in the update data
    const { id: _, ...updateData } = offerData
    
    console.log('Updating offer with:', {
      id: params.id,
      updateData,
      newImagesCount: newImages.length,
      imagesToDeleteCount: imagesToDelete.length
    })
    
    // Update the offer
    await updateOffer(
      params.id,
      updateData,
      newImages,
      imagesToDelete
    )
    
    return NextResponse.json({ 
      success: true,
      message: 'Offer updated successfully' 
    })
  } catch (error) {
    console.error("Error updating offer:", error)
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    )
  }
}
