import { NextResponse } from "next/server"
import { getOffers } from "@/lib/services/offerService"

export async function GET() {
  try {
    const offers = await getOffers()
    return NextResponse.json(offers)
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    )
  }
}
