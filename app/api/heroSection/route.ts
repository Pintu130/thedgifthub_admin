import { NextResponse } from "next/server"
import { collection, getDocs, getFirestore, query, orderBy, where, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from "firebase/storage"
import { app } from "@/lib/firebase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    
    if (!app) {
      return NextResponse.json(
        { error: "Firebase not initialized" },
        { status: 500 }
      )
    }

    const db = getFirestore(app)
    const heroSectionRef = collection(db, "heroSection")
    
    let q = query(heroSectionRef)
    
    if (statusFilter && statusFilter !== '') {
      if (!['active', 'inactive'].includes(statusFilter)) {
        return NextResponse.json(
          { error: 'Invalid status value. Must be either "active" or "inactive"' },
          { status: 400 }
        )
      }
      q = query(heroSectionRef, where("status", "==", statusFilter))
    }
    
    const querySnapshot = await getDocs(q)
    const heroItems: any[] = []
    
    querySnapshot.forEach((doc) => {
      heroItems.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    // Sort by createdAt if available, otherwise by id
    heroItems.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      }
      return 0
    })
    
    console.log('HeroSection API - Returning items:', heroItems.length)
    return NextResponse.json(heroItems)
  } catch (error) {
    console.error("Error fetching hero section items:", error)
    return NextResponse.json(
      { error: "Failed to fetch hero section items", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!app) {
      return NextResponse.json(
        { error: "Firebase not initialized" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const heroDataString = formData.get('heroData') as string
    const heroData = JSON.parse(heroDataString)
    const title = heroData.title
    const subtitle = heroData.subtitle
    const link = heroData.link
    const status = heroData.status
    const image = formData.get('image') as File
    
    // Validation
    if (!title || !subtitle || !link || !status) {
      return NextResponse.json(
        { error: "Missing required fields: title, subtitle, link, status" },
        { status: 400 }
      )
    }
    
    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be either "active" or "inactive"' },
        { status: 400 }
      )
    }
    
    const db = getFirestore(app)
    const storage = getStorage(app)
    
    let imageUrl = ''
    
    // Upload image if provided
    if (image && image instanceof File) {
      const timestamp = Date.now()
      const fileName = `hero-${timestamp}-${image.name}`
      const storageRef = ref(storage, `heroSection/${fileName}`)
      
      const buffer = await image.arrayBuffer()
      await uploadBytes(storageRef, buffer)
      imageUrl = await getDownloadURL(storageRef)
    }
    
    // Create document
    const heroSectionRef = collection(db, "heroSection")
    const newDoc = await addDoc(heroSectionRef, {
      title,
      subtitle,
      link,
      status,
      image: imageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    console.log('HeroSection API - Created new item:', newDoc.id)
    return NextResponse.json({
      id: newDoc.id,
      title,
      subtitle,
      link,
      status,
      image: imageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  } catch (error) {
    console.error("Error creating hero section item:", error)
    return NextResponse.json(
      { error: "Failed to create hero section item", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
