import { NextResponse } from "next/server"
import { createOffer } from "@/lib/services/offerService"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const offerData = JSON.parse(formData.get('offerData') as string)
    const images = formData.getAll('images') as File[]

    const offerId = await createOffer(offerData, images)
    return NextResponse.json({ id: offerId }, { status: 201 })
  } catch (error) {
    console.error("Error creating offer:", error)
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    )
  }
}
