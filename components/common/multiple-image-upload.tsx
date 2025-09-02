"use client"
import { useState, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, ImageIcon } from "lucide-react"

interface MultipleImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
}

const MultipleImageUpload = ({ images, onChange }: MultipleImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      // Create an array from the FileList
      const fileArray = Array.from(files)

      // Upload each file and get the URLs
      const uploadPromises = fileArray.map((file) => uploadImage(file))
      const uploadedUrls = await Promise.all(uploadPromises)

      // Filter out any failed uploads (null values)
      const validUrls = uploadedUrls.filter((url) => url !== null) as string[]

      // Update the images state with the new URLs
      onChange([...images, ...validUrls])
    } catch (error) {
      console.error("Error uploading images:", error)
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    // This is a placeholder for your actual image upload API
    // Replace with your actual image upload implementation
    try {
      const formData = new FormData()
      formData.append("file", file)

      // Replace with your actual API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      return data.url // Assuming your API returns the URL of the uploaded image
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image || "/placeholder.svg"}
              alt={`Uploaded image ${index + 1}`}
              className="h-24 w-auto object-contain border rounded"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" onClick={handleBrowseClick} disabled={isUploading} className="flex items-center gap-2">
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Images
            </>
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />

        {images.length === 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <ImageIcon className="h-4 w-4 mr-1" />
            No images uploaded yet
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF. Max file size: 5MB.</p>
    </div>
  )
}

export default MultipleImageUpload
