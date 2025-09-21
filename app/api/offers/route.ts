import { NextResponse } from "next/server"
import { getOffers, getAllOffers, getOffersByStatus, getOffersByCategory } from "@/lib/services/offerService"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category')
    const statusFilter = searchParams.get('status')

    console.log('Offers API - Category filter:', categoryFilter)
    console.log('Offers API - Status filter:', statusFilter)

    let offers
    
    if (categoryFilter && categoryFilter !== '' && statusFilter && statusFilter !== '') {
      // Both filters provided
      console.log('Fetching offers by category and status')
      
      // Validate status value
      if (!['active', 'inactive'].includes(statusFilter)) {
        return NextResponse.json(
          { error: 'Invalid status value. Must be either "active" or "inactive"' },
          { status: 400 }
        )
      }
      
      offers = await getOffers(categoryFilter, statusFilter)
    } else if (categoryFilter && categoryFilter !== '') {
      // Category filter only
      console.log('Fetching offers by category:', categoryFilter)
      offers = await getOffersByCategory(categoryFilter)
    } else if (statusFilter && statusFilter !== '') {
      // Status filter only
      console.log('Fetching offers by status:', statusFilter)
      
      // Validate status value
      if (!['active', 'inactive'].includes(statusFilter)) {
        return NextResponse.json(
          { error: 'Invalid status value. Must be either "active" or "inactive"' },
          { status: 400 }
        )
      }
      
      offers = await getOffersByStatus(statusFilter)
    } else {
      // No filters
      console.log('Fetching all offers')
      offers = await getAllOffers()
    }
    
    console.log('Offers API - Returning offers:', offers.length, 'items')
    return NextResponse.json(offers)
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json(
      { error: "Failed to fetch offers", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}