export interface CompressedImageResult {
  file: File
  base64: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export const compressImage = async (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8,
): Promise<CompressedImageResult> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"))
            return
          }

          // Create compressed file
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          })

          // Convert to base64
          const reader = new FileReader()
          reader.onload = () => {
            const base64String = (reader.result as string).split(",")[1]

            resolve({
              file: compressedFile,
              base64: base64String,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: Math.round(((file.size - blob.size) / file.size) * 100),
            })
          }
          reader.onerror = () => reject(new Error("Failed to convert to base64"))
          reader.readAsDataURL(blob)
        },
        file.type,
        quality,
      )
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}
