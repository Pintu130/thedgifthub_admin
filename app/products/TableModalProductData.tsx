"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import Loader from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import AdvancedCKEditor from "@/components/common/advanced-ckeditor"

interface ProductFormData {
  id?: string
  name: string
  amount: string
  discount: string
  availableOffers: string
  highlights: string
  images?: File[]
  imagesPreviews?: string[]
}

interface FormErrors {
  name?: string
  amount?: string
  discount?: string
  availableOffers?: string
  highlights?: string
  images?: string
}

interface Props {
  isModalVisible: boolean
  onClose: () => void
  title: string
  closeLabel: string
  saveLabel: string
  formData: ProductFormData
  setFormData: (data: ProductFormData) => void
  getTotalProducts: () => void
}

export default function TableModalProductData({
  isModalVisible,
  onClose,
  title,
  closeLabel,
  saveLabel,
  formData,
  setFormData,
  getTotalProducts,
}: Props) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const imageInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!formData.id

  useEffect(() => {
    if (isModalVisible) {
      setErrors({})
      setIsSubmitting(false)
      if (!formData.images) {
        setFormData({
          ...formData,
          images: [],
          imagesPreviews: [],
          amount: formData.amount || "",
          discount: formData.discount || "",
          availableOffers: formData.availableOffers || "",
          highlights: formData.highlights || "",
        })
      }
    }
  }, [isModalVisible, formData, setFormData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)
    const validFiles: File[] = []
    const newPreviews: string[] = []
    const currentImages = formData.images || []

    if (currentImages.length >= 4) {
      toast({
        variant: "destructive",
        title: "Maximum images reached",
        description: "You can upload maximum 4 images.",
      })
      return
    }

    files.forEach((file) => {
      if (currentImages.length + validFiles.length >= 4) {
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
        })
        return
      }

      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

    if (validFiles.length > 0) {
      const currentPreviews = formData.imagesPreviews || []

      setFormData({
        ...formData,
        images: [...currentImages, ...validFiles],
        imagesPreviews: [...currentPreviews, ...newPreviews],
      })

      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }))
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    const currentImages = formData.images || []
    const currentPreviews = formData.imagesPreviews || []

    if (currentPreviews[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(currentPreviews[index])
    }

    const newImages = currentImages.filter((_, i) => i !== index)
    const newPreviews = currentPreviews.filter((_, i) => i !== index)

    setFormData({
      ...formData,
      images: newImages,
      imagesPreviews: newPreviews,
    })
  }

  const triggerImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click()
    }
  }

  const handleOffersEditorChange = (_: any, editor: any) => {
    const content = editor.getData()
    setFormData({ ...formData, availableOffers: content })

    if (errors.availableOffers) {
      setErrors((prev) => ({ ...prev, availableOffers: undefined }))
    }
  }

  const handleHighlightsEditorChange = (_: any, editor: any) => {
    const content = editor.getData()
    setFormData({ ...formData, highlights: content })

    if (errors.highlights) {
      setErrors((prev) => ({ ...prev, highlights: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required"
    }

    if (!formData.discount.trim()) {
      newErrors.discount = "Discount is required"
    }

    const tempDiv1 = document.createElement("div")
    tempDiv1.innerHTML = formData.availableOffers || ""
    const offersContent = tempDiv1.textContent || tempDiv1.innerText || ""

    if (!offersContent.trim()) {
      newErrors.availableOffers = "Available offers is required"
    }

    const tempDiv2 = document.createElement("div")
    tempDiv2.innerHTML = formData.highlights || ""
    const highlightsContent = tempDiv2.textContent || tempDiv2.innerText || ""

    if (!highlightsContent.trim()) {
      newErrors.highlights = "Highlights is required"
    }

    if (!isEditing && (!formData.images || formData.images.length < 2)) {
      newErrors.images = "Minimum 2 images are required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const formDataToSend = new FormData()

      // Add product data
      formDataToSend.append("name", formData.name)
      formDataToSend.append("amount", formData.amount)
      formDataToSend.append("discount", formData.discount || "")
      formDataToSend.append("availableOffers", formData.availableOffers || "")
      formDataToSend.append("highlights", formData.highlights || "")

      // Add images
      if (formData.images) {
        formData.images.forEach((image, index) => {
          formDataToSend.append(`image${index}`, image)
        })
      }

      let response: Response

      if (isEditing) {
        // Add existing images for update
        if (formData.imagesPreviews) {
          const existingImages = formData.imagesPreviews.filter((url) => !url.startsWith("blob:"))
          formDataToSend.append("existingImages", JSON.stringify(existingImages))
        }

        // Add new images for update
        if (formData.images) {
          formData.images.forEach((image, index) => {
            formDataToSend.append(`newImage${index}`, image)
          })
        }

        response = await fetch(`/api/products/${formData.id}`, {
          method: "PUT",
          body: formDataToSend,
        })
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          body: formDataToSend,
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save product")
      }

      toast({
        title: "Success",
        description: isEditing ? "Product updated successfully" : "Product created successfully",
      })

      // Clean up blob URLs
      if (formData.imagesPreviews) {
        formData.imagesPreviews.forEach((preview) => {
          if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview)
          }
        })
      }

      onClose()
      getTotalProducts()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      if (formData.imagesPreviews) {
        formData.imagesPreviews.forEach((preview) => {
          if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview)
          }
        })
      }
    }
  }, [formData.imagesPreviews])

  return (
    <Modal
      isOpen={isModalVisible}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={title}
      message=""
      closeLabel={closeLabel}
      confirmLabel={saveLabel}
      isLoading={isSubmitting}
    >
      {isSubmitting && <Loader />}

      <div>
        <div className="space-y-6 p-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Product Images (Min: 2, Max: 4) {!isEditing && <span className="text-red-500">*</span>}
            </label>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div
                  className={`border ${
                    errors.images ? "border-red-500" : "border-gray-300 border-dashed"
                  } rounded-lg p-6 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
                    formData.images && formData.images.length >= 4 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={formData.images && formData.images.length >= 4 ? undefined : triggerImageUpload}
                >
                  <input
                    type="file"
                    ref={imageInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isSubmitting || (formData.images && formData.images.length >= 4)}
                  />

                  <Plus className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 text-center">
                    {formData.images && formData.images.length >= 4
                      ? "Maximum 4 images uploaded"
                      : `Click to upload product images (${formData.images?.length || 0}/4)`}
                    <br />
                    <span className="text-xs text-gray-400">SVG, PNG, JPG up to 5MB each</span>
                  </p>
                </div>
                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Images ({formData.imagesPreviews?.length || 0}/4)
                </h4>
                <div className="grid grid-cols-2 gap-3 h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                  {formData.imagesPreviews && formData.imagesPreviews.length > 0 ? (
                    formData.imagesPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Product ${index + 1}`}
                          className="w-full h-28 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-10"
                          disabled={isSubmitting}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 flex items-center justify-center text-center text-gray-400 text-sm py-8">
                      No images uploaded yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
              error={errors.name}
            />

            <FormInput
              label="Amount ($)"
              name="amount"
              value={formData.amount || ""}
              onChange={handleChange}
              placeholder="e.g. 26.99"
              required
              error={errors.amount}
            />

            <FormInput
              label="Discount (%)"
              name="discount"
              value={formData.discount || ""}
              onChange={handleChange}
              placeholder="e.g. 10"
              required
              error={errors.discount}
            />

   
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Available Offers <span className="text-red-500">*</span>
            </label>
            <div className="w-full max-h-[250px] overflow-y-auto border rounded-md scrollbar-thin scrollbar-thumb-gray-300">
              <AdvancedCKEditor
                data={formData.availableOffers || ""}
                onChange={handleOffersEditorChange}
                placeholder="Enter available offers and promotions..."
                disabled={isSubmitting}
              />
            </div>
            {errors.availableOffers && <p className="text-red-500 text-sm">{errors.availableOffers}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Highlights <span className="text-red-500">*</span>
            </label>
            <div className="w-full max-h-[250px] overflow-y-auto border rounded-md scrollbar-thin scrollbar-thumb-gray-300">
              <AdvancedCKEditor
                data={formData.highlights || ""}
                onChange={handleHighlightsEditorChange}
                placeholder="Enter product highlights and key features..."
                disabled={isSubmitting}
              />
            </div>
            {errors.highlights && <p className="text-red-500 text-sm">{errors.highlights}</p>}
          </div>
        </div>
      </div>
    </Modal>
  )
}
