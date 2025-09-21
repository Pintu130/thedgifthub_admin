"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
// import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import Loader from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import AdvancedCKEditor from "@/components/common/advanced-ckeditor"
import Modal from "@/components/common/Modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface OfferFormData {
  id?: string
  categoryId: string
  discountType: 'percentage' | 'price'
  discountLabel: string
  priceLabel: string
  value: string
  images: Array<File | string>
  imagesPreviews: string[]
  status: 'active' | 'inactive'
  availableOffers?: string
  highlights?: string
}


interface FormErrors {
  categoryId?: string
  discountType?: string
  discountLabel?: string
  priceLabel?: string
  value?: string
  images?: string
  availableOffers?: string
  highlights?: string
}

interface Category {
  id: string
  name: string
}

interface Props {
  isModalVisible: boolean
  onClose: () => void
  title: string
  closeLabel: string
  saveLabel: string
  formData: OfferFormData
  setFormData: React.Dispatch<React.SetStateAction<OfferFormData>>
  getTotalOffers: () => Promise<void>
  categories: Category[]
  isSubmitting?: boolean
  onSubmit: (data: OfferFormData) => Promise<void>
}

const discountTypeOptions = [
  'Get Upto',
  'Flat Discount',
  'Save Upto',
  'Special Offer',
  'Mega Deal',
  'Limited Time Offer',
  'Exclusive Offer',
  'Festive Deal',
  'Season Sale',
  'Hot Deal'
]

const priceTypeOptions = [
  'Starting Price (₹)',
  'Offer Price',
  'Best Price',
  'Base Price',
  'Price From',
  'Only Price',
  'Grab Now Price',
  'Special Price',
  'Deal Price',
  'Festive Price'
]

export default function TableModalOfferData({
  isModalVisible,
  onClose,
  title,
  closeLabel,
  saveLabel,
  formData,
  setFormData,
  getTotalOffers,
  categories,
  isSubmitting,
  onSubmit,
}: Props) {
  const { toast } = useToast()
  const [errors, setErrors] = useState<FormErrors>({})
  const [showDiscountInput, setShowDiscountInput] = useState(true)
  console.log('============000', formData);
  const imageInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!formData.id

  useEffect(() => {
    if (isModalVisible) {
      setErrors({})
      if (!formData.images) {
        setFormData(prev => ({
          ...prev,
          images: [],
          imagesPreviews: [],
          discountType: prev.discountType || 'percentage',
          discountLabel: prev.discountLabel || '',
          priceLabel: prev.priceLabel || '',
          value: prev.value || '',
          status: prev.status || 'active'
        }))
      }
    }
  }, [isModalVisible, formData, setFormData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'discountType') {
      const isPercentage = value === 'percentage'
      setShowDiscountInput(isPercentage)
      setFormData({
        ...formData,
        discountType: isPercentage ? 'percentage' : 'price',
        discountLabel: isPercentage ? formData.discountLabel : '',
        priceLabel: isPercentage ? '' : formData.priceLabel,
        value: '' // Reset value when switching between types
      })
    } else if (name === 'value') {
      // Only allow numbers and validate based on input type
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        // If it's a percentage, limit to 100
        if (formData.discountType === 'percentage' && parseFloat(value) > 100) {
          return
        }
        setFormData({ ...formData, [name]: value })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
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
    const existingImageCount = currentImages.filter(img => typeof img === 'string').length

    // Calculate available slots for new images (max 3 for offers)
    const availableSlots = 3 - (existingImageCount + currentImages.filter(img => img instanceof File).length)

    files.forEach((file) => {
      // Check if we've reached the maximum number of images (3)
      if (existingImageCount + validFiles.length >= 3) {
        toast({
          variant: "destructive",
          title: "Maximum images reached",
          description: "You can upload up to 3 images for an offer.",
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
      setFormData(prev => ({
        ...prev,
        images: [...currentImages, ...validFiles],
        imagesPreviews: [...currentPreviews, ...newPreviews],
      }))

      if (errors.images) {
        setErrors(prev => ({ ...prev, images: undefined }))
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => {
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

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required"
    }

    if (formData.discountType === 'percentage' && !formData.discountLabel) {
      newErrors.discountLabel = "Discount type is required"
    }

    if (formData.discountType === 'price' && !formData.priceLabel) {
      newErrors.priceLabel = "Price type is required"
    }

    if (!formData.value) {
      newErrors.value = formData.discountType === 'percentage'
        ? "Discount percentage is required"
        : "Price value is required"
    } else if (formData.discountType === 'percentage' && (parseFloat(formData.value) < 0 || parseFloat(formData.value) > 100)) {
      newErrors.value = "Discount must be between 0 and 100%"
    } else if (formData.discountType === 'price' && parseFloat(formData.value) < 0) {
      newErrors.value = "Price cannot be negative"
    }

    if (!formData.images || formData.images.length === 0) {
      newErrors.images = "At least one image is required"
    } else if (formData.images.length > 3) {
      newErrors.images = "Maximum 3 images allowed"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData).catch((error: Error) => {
        console.error('Error submitting form:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to submit form. Please try again.",
          variant: "destructive",
        })
      })
    }
  }

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="space-y-6 p-4">
            {/* Image Upload Section */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left: Upload Box */}
              <div className="w-full lg:w-1/3">
                <label className="block text-sm font-medium text-gray-700">
                  Offer Images <span className="text-red-500">*</span> ({formData.images?.length || 0}/3)
                </label>
                <div
                  onClick={() => {
                    if (!isSubmitting && (formData.images?.length || 0) < 3) {
                      imageInputRef.current?.click();
                    }
                  }}
                  className={`mt-1 flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isSubmitting || (formData.images?.length || 0) >= 3 ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
        ${errors.images ? 'border-red-500' : ''}`}
                >
                  <input
                    type="file"
                    ref={imageInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isSubmitting || (formData.images?.length || 0) >= 3}
                  />
                  <Plus className={`h-12 w-12 mb-2 ${isSubmitting || (formData.images?.length || 0) >= 3 ? 'text-gray-300' : 'text-gray-400'}`} />
                  <p className={`text-sm text-center ${isSubmitting || (formData.images?.length || 0) >= 3 ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isSubmitting
                      ? 'Uploading...'
                      : (formData.images?.length || 0) >= 3
                        ? 'Maximum 3 images reached'
                        : 'Click or drag to upload images'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB each (max 3 images)
                  </p>
                </div>
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              </div>

              {/* Right: Image Previews */}
              <div className="w-full lg:w-2/3 mt-6">
                {formData.imagesPreviews?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.imagesPreviews.map((preview, index) => (
                      <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={preview || '/placeholder.svg'}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-36 object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          disabled={isSubmitting}
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>



            {/* Two-column responsive form section */}
            <div className="!space-y-6">
              {/* First Row: Category, Offer Type, Status */}
              <div className="flex flex-wrap gap-10">
                {/* Category */}
                <div className="w-full lg:w-[49%] space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <Select
                    value={formData.categoryId || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      className={`w-full border rounded-md shadow-sm px-2 py-2 cursor-pointer ${errors.categoryId ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id!}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                  )}
                </div>


                {/* Offer Type */}
                <div className="w-full lg:w-[25%] space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Offer Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="discountType"
                        value="percentage"
                        checked={formData.discountType === 'percentage'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        disabled={isSubmitting}
                      />
                      <span className="ml-2 text-gray-700">Discount (%)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="discountType"
                        value="price"
                        checked={formData.discountType === 'price'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        disabled={isSubmitting}
                      />
                      <span className="ml-2 text-gray-700">Price</span>
                    </label>
                  </div>
                </div>

                {/* Status */}
                <div className="w-full lg:flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <Select
                    value={formData.status} // default value will be 'active'
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "active" | "inactive",
                      })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full border rounded-md shadow-sm px-2 py-2 cursor-pointer">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second Row: Discount/Price Value & Discount/Price Type */}
              <div className="flex gap-4">
                {/* Discount/Price Value */}
                <div className="w-full lg:w-1/2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.discountType === 'percentage' ? 'Discount Value (%)' : 'Price Value (₹)'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    {formData.discountType === 'price' && (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                    )}
                    <input
                      type="number"
                      name="value"
                      value={formData.value || ''}
                      onChange={handleChange}
                      placeholder={formData.discountType === 'percentage' ? '0-100' : '0.00'}
                      min={formData.discountType === 'percentage' ? '0' : '1'}
                      max={formData.discountType === 'percentage' ? '100' : ''}
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      className={`block w-full ${formData.discountType === 'price' ? 'pl-7' : ''} px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.value ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isSubmitting}
                    />
                    {formData.discountType === 'percentage' && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    )}
                  </div>
                  {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
                </div>

                {/* Discount/Price Type */}
                <div className="w-full lg:w-1/2 space-y-2">
                  {formData.discountType === "percentage" ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700">
                        Discount Type <span className="text-red-500">*</span>
                      </label>

                      <Select
                        value={formData.discountLabel || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, discountLabel: value })
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          className={`w-full border rounded-md shadow-sm px-2 py-2 cursor-pointer ${errors.discountLabel ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>

                        <SelectContent>
                          {discountTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.discountLabel && (
                        <p className="text-red-500 text-sm mt-1">{errors.discountLabel}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700">
                        Price Type <span className="text-red-500">*</span>
                      </label>

                      <Select
                        value={formData.priceLabel || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, priceLabel: value })
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          className={`w-full border rounded-md shadow-sm px-2 py-2 cursor-pointer ${errors.priceLabel ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          <SelectValue placeholder="Select price type" />
                        </SelectTrigger>

                        <SelectContent>
                          {priceTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.priceLabel && (
                        <p className="text-red-500 text-sm mt-1">{errors.priceLabel}</p>
                      )}
                    </>
                  )}
                </div>

              </div>
            </div>



          </div>

          {/* Status Toggle */}

        </div>


      </form>
    </Modal>
  );
}
