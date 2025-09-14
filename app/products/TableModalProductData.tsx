"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import Loader from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import AdvancedCKEditor from "@/components/common/advanced-ckeditor"
import { Switch } from "@/components/ui/switch"

export interface ProductFormData {
  id?: string
  name: string
  amount: string // string because it comes from input
  discount: string // string because it comes from input
  originalPrice: string // 👈 change from number → string
  availableOffers: string
  highlights: string
  description: string
  status: "active" | "inactive"
  images: Array<File | string>
  imagesPreviews: string[]
  productPrice: number // computed / saved as number
  discountPercentage: number // computed / saved as number
  categoryId?: string
}

interface FormErrors {
  name?: string
  amount?: string
  discount?: string
  availableOffers?: string
  highlights?: string
  images?: string
  description?: string
  status?: string
  categoryId?: string
}

interface Category {
  id: string
  name: string
}

interface Props {
  isModalVisible: boolean
  onClose: () => void
  title: string
  categories: Category[]
  closeLabel: string
  saveLabel: string
  formData: ProductFormData
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
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
  categories,
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
          description: formData.description || "",
          status: formData.status || "inactive",
        })
      }
    }
  }, [isModalVisible, formData, setFormData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? "active" : "inactive"
    setFormData({ ...formData, status: newStatus })

    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const files = Array.from(e.target.files)
    const currentImages = Array.isArray(formData.images) ? [...formData.images] : []
    const currentPreviews = Array.isArray(formData.imagesPreviews) ? [...formData.imagesPreviews] : []

    const validFiles: File[] = []
    const newPreviews: string[] = []

    // Count existing non-blob URLs (these are the ones already uploaded)
    const existingImageCount = currentImages.filter((img) => typeof img === "string").length

    // Calculate available slots for new images
    const availableSlots = 4 - (existingImageCount + currentImages.filter((img) => img instanceof File).length)

    files.forEach((file) => {
      // Check if we've reached the maximum number of images (4)
      if (existingImageCount + validFiles.length >= 4) {
        toast({
          variant: "destructive",
          title: "Maximum images reached",
          description: "You can upload up to 4 images.",
        })
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
      setFormData((prev) => ({
        ...prev,
        images: [...currentImages, ...validFiles],
        imagesPreviews: [...currentPreviews, ...newPreviews],
      }))

      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }))
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => {
      // Create new arrays without the item at the specified index
      const newImages = [...(Array.isArray(prev.images) ? prev.images : [])]
      const newPreviews = [...(Array.isArray(prev.imagesPreviews) ? prev.imagesPreviews : [])]

      // Revoke the object URL if it's a blob URL
      if (newPreviews[index]?.startsWith("blob:")) {
        URL.revokeObjectURL(newPreviews[index])
      }

      // Remove the image and its preview
      newImages.splice(index, 1)
      newPreviews.splice(index, 1)

      return {
        ...prev,
        images: newImages,
        imagesPreviews: newPreviews,
      }
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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.categoryId?.trim()) {
      newErrors.categoryId = "Category is required"
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

      // Prepare the product data
      const productData = {
        productName: formData.name,
        productPrice: Number.parseFloat(formData.amount) || 0,
        originalPrice: Number.parseFloat(formData.originalPrice) || 0,
        discountPercentage: Number.parseFloat(formData.discount) || 0,
        categoryId: formData.categoryId, // ✅ Include categoryId
        availableOffers: formData.availableOffers,
        highlights: formData.highlights,
        description: formData.description,
        status: formData.status,
      }

      console.log("Submitting product data:", productData) // ✅ Debug log

      // Append all non-image fields
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Handle images - separate existing URLs from new files
      const existingImages: string[] = []
      const newImageFiles: File[] = []

      formData.images.forEach((item) => {
        if (typeof item === "string") {
          // This is an existing image URL
          existingImages.push(item)
        } else if (item instanceof File) {
          // This is a new file to upload
          newImageFiles.push(item)
        }
      })

      // First add all existing images with consistent field name
      existingImages.forEach((url) => {
        formDataToSend.append("images", url)
      })

      // Then add all new image files with the same field name
      newImageFiles.forEach((file) => {
        formDataToSend.append("images", file)
      })

      let response: Response
      let url = "/api/products"
      let method = "POST"

      if (isEditing && formData.id) {
        url = `/api/products/${formData.id}`
        method = "PATCH"
      }

      response = await fetch(url, {
        method,
        body: formDataToSend,
      })

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
      width="70rem"
    >
      {isSubmitting && <Loader />}

      <div className="!space-y-4 p-3">
        {/* Category */}
        <div className="w-full space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            value={formData.categoryId || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.categoryId ? "border-red-500" : "border-gray-300"
              }`}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
          )}
        </div>

        {/* Product Images */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Product Images (Min: 2, Max: 4){" "}
            {!isEditing && <span className="text-red-500">*</span>}
          </label>

          {/* Custom grid 30% : 70% */}
          <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
            {/* Upload box (30%) */}
            <div
              className={`border ${errors.images ? "border-red-500" : "border-gray-300 border-dashed"
                } rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px] ${formData.images && formData.images.length >= 4
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
              onClick={
                formData.images && formData.images.length >= 4
                  ? undefined
                  : triggerImageUpload
              }
            >
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={
                  isSubmitting || (formData.images && formData.images.length >= 4)
                }
              />
              <Plus className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center">
                {formData.images && formData.images.length >= 4
                  ? "Maximum 4 images uploaded"
                  : `Click to upload (${formData.images?.length || 0}/4)`}
              </p>
            </div>

            {/* Preview images (70%) */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Uploaded Images ({formData.imagesPreviews?.length || 0}/4)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.imagesPreviews && formData.imagesPreviews.length > 0 ? (
                  formData.imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="w-full h-28 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 flex items-center justify-center text-center text-gray-400 text-sm py-6">
                    No images uploaded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Product details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            label="Original Price ($)"
            type="number"
            name="originalPrice"
            value={formData.originalPrice?.toString() || ""}
            onChange={handleChange}
            placeholder="e.g. 35.00"
          />
          <FormInput
            label="Amount ($)"
            name="amount"
            type="number"
            value={formData.amount || ""}
            onChange={handleChange}
            placeholder="e.g. 26.99"
            required
            error={errors.amount}
          />
          <FormInput
            label="Discount (%)"
            name="discount"
            type="number"
            value={formData.discount || ""}
            onChange={handleChange}
            placeholder="e.g. 10"
            required
            error={errors.discount}
          />
        </div>

        {/* Description & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y h-30"
              // 👆 resize only vertical & default height
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>


          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50">
              <Switch
                checked={formData.status === "active"}
                onCheckedChange={handleStatusChange}
                disabled={isSubmitting}
              />
              <span
                className={`text-sm font-medium ${formData.status === "active" ? "text-green-600" : "text-red-600"
                  }`}
              >
                {formData.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Offers & Highlights side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Available Offers <span className="text-red-500">*</span>
            </label>
            <div className="w-full min-h-[200px] border rounded-md">
              <AdvancedCKEditor
                data={formData.availableOffers || ""}
                onChange={handleOffersEditorChange}
                placeholder="Enter available offers..."
                disabled={isSubmitting}
              />
            </div>
            {errors.availableOffers && (
              <p className="text-red-500 text-sm">{errors.availableOffers}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Highlights <span className="text-red-500">*</span>
            </label>
            <div className="w-full min-h-[200px] border rounded-md">
              <AdvancedCKEditor
                data={formData.highlights || ""}
                onChange={handleHighlightsEditorChange}
                placeholder="Enter product highlights..."
                disabled={isSubmitting}
              />
            </div>
            {errors.highlights && (
              <p className="text-red-500 text-sm">{errors.highlights}</p>
            )}
          </div>
        </div>
      </div>
    </Modal>

  )
}