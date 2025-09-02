import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Fetch the image as a binary stream
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" })
    const base64 = Buffer.from(response.data, "binary").toString("base64")

    // Get the content type from the response headers
    const contentType = response.headers["content-type"]

    // Return the Base64 string along with the content type
    return NextResponse.json({
      base64: `data:${contentType};base64,${base64}`,
    })
  } catch (error) {
    console.error("Error converting image:", error)
    return NextResponse.json({ error: "Failed to convert image to Base64" }, { status: 500 })
  }
}
