"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import FormInput from "@/components/common/FormInput"
import Loader from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import AdvancedCKEditor from "@/components/common/advanced-ckeditor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product, ProductFormData } from "@/lib/types/product"

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
  outOfStock?: string
  isBestSell?: string
  isCorporateGifts?: string
  // Shipping errors
  length?: string
  breadth?: string
  height?: string
  weight?: string
  // SEO errors
  metaTitle?: string
  metaKeywords?: string
  metaDescription?: string
}

interface Category {
  id: string
  name: string
}

interface Props {
  onSuccess: () => void
  onCancel: () => void
  mode: "add" | "edit"
  productId?: string
}

export default function ProductForm({
  onSuccess,
  onCancel,
  mode,
  productId,
}: Props) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    id: "",
    name: "",
    categoryId: "",
    amount: "",
    discount: "",
    originalPrice: "",
    availableOffers: "",
    highlights: "",
    description: "",
    status: "inactive",
    outOfStock: "no", // Add outOfStock field with default value
    isBestSell: "no", // Add isBestSell field with default value
    isCorporateGifts: "no", // Add isCorporateGifts field with default value
    images: [],
    imagesPreviews: [],
    productPrice: 0,
    discountPercentage: 0,
    slug: "", // Add slug field
    // Shipping details
    length: "",
    breadth: "",
    height: "",
    weight: "",
    // SEO details
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const isEditing = mode === "edit"

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        const formattedCategories = data.map((category: any) => ({
          id: category.id,
          name: category.name
        }))
        setCategories(formattedCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please try again later.",
        })
      }
    }

    fetchCategories()
  }, [toast])

  // Fetch product data for edit mode
  useEffect(() => {
    if (isEditing && productId) {
      const fetchProduct = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/products/${productId}`)
          if (!response.ok) {
            throw new Error('Failed to fetch product')
          }
          const product: Product = await response.json()
          
          setFormData({
            id: product.id,
            categoryId: product.categoryId || '',
            name: product.productName || "",
            amount: product.productPrice?.toString() || "0",
            discount: product.discountPercentage?.toString() || "0",
            availableOffers: product.availableOffers || "",
            highlights: product.highlights || "",
            description: product.description || "",
            status: product.status || "inactive",
            outOfStock: product.outOfStock || "no", // Add outOfStock for edit mode
            isBestSell: product.isBestSell || "no", // Add isBestSell for edit mode
            isCorporateGifts: product.isCorporateGifts || "no", // Add isCorporateGifts for edit mode
            images: product.images || [],
            imagesPreviews: Array.isArray(product.images) ? product.images : [],
            productPrice: product.productPrice || 0,
            originalPrice: product.originalPrice?.toString() || "0",
            discountPercentage: product.discountPercentage || 0,
            slug: product.slug || generateSlug(product.productName || ""), // Add slug for edit mode
            // Shipping details
            length: product.length?.toString() || "",
            breadth: product.breadth?.toString() || "",
            height: product.height?.toString() || "",
            weight: product.weight?.toString() || "",
            // SEO details
            metaTitle: product.metaTitle || "",
            metaKeywords: product.metaKeywords || "",
            metaDescription: product.metaDescription || "",
          })
        } catch (error) {
          console.error("Error fetching product:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load product. Please try again later.",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchProduct()
    }
  }, [isEditing, productId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Generate slug when product name changes
    if (name === 'name') {
      const slug = generateSlug(value)
      setFormData(prev => ({ ...prev, slug }))
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Function to generate slug from product name
  const generateSlug = (productName: string): string => {
    return productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove hyphens from start and end
  }

  const handleStatusChange = (value: "active" | "inactive") => {
    setFormData({ ...formData, status: value })

    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }))
    }
  }

  const handleOutOfStockChange = (value: "yes" | "no") => {
    setFormData({ ...formData, outOfStock: value })

    if (errors.outOfStock) {
      setErrors((prev) => ({ ...prev, outOfStock: undefined }))
    }
  }

  const handleIsBestSellChange = (value: "yes" | "no") => {
    setFormData({ ...formData, isBestSell: value })

    if (errors.isBestSell) {
      setErrors((prev) => ({ ...prev, isBestSell: undefined }))
    }
  }

  const handleIsCorporateGiftsChange = (value: "yes" | "no") => {
    setFormData({ ...formData, isCorporateGifts: value })

    if (errors.isCorporateGifts) {
      setErrors((prev) => ({ ...prev, isCorporateGifts: undefined }))
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
    const availableSlots = 6 - (existingImageCount + currentImages.filter((img) => img instanceof File).length)

    files.forEach((file) => {
      // Check if we've reached the maximum number of images (6)
      if (existingImageCount + validFiles.length >= 6) {
        toast({
          variant: "destructive",
          title: "Maximum images reached",
          description: "You can upload up to 6 images.",
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
        categoryId: formData.categoryId,
        availableOffers: formData.availableOffers,
        highlights: formData.highlights,
        description: formData.description,
        status: formData.status,
        outOfStock: formData.outOfStock, // Include outOfStock in the data sent to Firebase
        isBestSell: formData.isBestSell, // Include isBestSell in the data sent to Firebase
        isCorporateGifts: formData.isCorporateGifts, // Include isCorporateGifts in the data sent to Firebase
        slug: formData.slug, // Include slug in the data sent to Firebase
        // Shipping details
        length: Number.parseFloat(formData.length || "0") || 0,
        breadth: Number.parseFloat(formData.breadth || "0") || 0,
        height: Number.parseFloat(formData.height || "0") || 0,
        weight: Number.parseFloat(formData.weight || "0") || 0,
        // SEO details
        metaTitle: formData.metaTitle || "",
        metaKeywords: formData.metaKeywords || "",
        metaDescription: formData.metaDescription || "",
      }

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

      onSuccess()
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    )
  }

  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">
          {isEditing ? "Edit Product" : "Add New Product"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSubmitting && <Loader />}

        {/* Category and Product Name */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-full space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>

            <Select
              value={formData.categoryId || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryId: value === "none" ? "" : value,
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={`w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.categoryId ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">Select a category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
            )}
          </div>

          <FormInput
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
            error={errors.name}
          />
        </div>

        {/* Product Images */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Product Images (Min: 2, Max: 6){" "}
            {!isEditing && <span className="text-red-500">*</span>}
          </label>

          {/* Custom grid 30% : 70% */}
          <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
            {/* Upload box (30%) */}
            <div
              className={`border ${errors.images ? "border-red-500" : "border-gray-300 border-dashed"
                } rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px] ${formData.images && formData.images.length >= 6
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
              onClick={
                formData.images && formData.images.length >= 6
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
                  isSubmitting || (formData.images && formData.images.length >= 6)
                }
              />
              <Plus className="h-6 w-6 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center">
                {formData.images && formData.images.length >= 6
                  ? "Maximum 6 images uploaded"
                  : `Click to upload (${formData.images?.length || 0}/6)`}
              </p>
            </div>

            {/* Preview images (70%) */}
            <div className="space-y-2 pr-4">
              <h4 className="text-sm font-medium text-gray-700">
                Uploaded Images ({formData.imagesPreviews?.length || 0}/6)
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          <FormInput
            label="Original Price (₹)"
            type="number"
            name="originalPrice"
            value={formData.originalPrice?.toString() || ""}
            onChange={handleChange}
            placeholder="e.g. 35.00"
          />
          <FormInput
            label="Amount (₹)"
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Out of Stock
            </label>
            <Select
              value={formData.outOfStock || "no"}
              onValueChange={handleOutOfStockChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={`w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.outOfStock ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <SelectValue placeholder="Select Out of Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
            {errors.outOfStock && (
              <p className="text-red-500 text-sm">{errors.outOfStock}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Is Best Sell
            </label>
            <Select
              value={formData.isBestSell || "no"}
              onValueChange={handleIsBestSellChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={`w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.isBestSell ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <SelectValue placeholder="Select Is Best Sell" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
            {errors.isBestSell && (
              <p className="text-red-500 text-sm">{errors.isBestSell}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Is Corporate Gifts
            </label>
            <Select
              value={formData.isCorporateGifts || "no"}
              onValueChange={handleIsCorporateGiftsChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={`w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.isCorporateGifts ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <SelectValue placeholder="Select Is Corporate Gifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
            {errors.isCorporateGifts && (
              <p className="text-red-500 text-sm">{errors.isCorporateGifts}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.status || "active"}
              onValueChange={handleStatusChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={`w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.status ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Description */}
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
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
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

        {/* Shipping Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              label="Length (cm)"
              name="length"
              type="number"
              value={formData.length || ""}
              onChange={handleChange}
              placeholder="0"
              error={errors.length}
            />
            <FormInput
              label="Breadth (cm)"
              name="breadth"
              type="number"
              value={formData.breadth || ""}
              onChange={handleChange}
              placeholder="0"
              error={errors.breadth}
            />
            <FormInput
              label="Height (cm)"
              name="height"
              type="number"
              value={formData.height || ""}
              onChange={handleChange}
              placeholder="0"
              error={errors.height}
            />
            <FormInput
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight || ""}
              onChange={handleChange}
              placeholder="0"
              error={errors.weight}
            />
          </div>
        </div>

        {/* SEO Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Purpose</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FormInput
              label="Meta Title"
              name="metaTitle"
              value={formData.metaTitle || ""}
              onChange={handleChange}
              placeholder="Enter meta title..."
              error={errors.metaTitle}
            />
            <FormInput
              label="Meta Keywords"
              name="metaKeywords"
              value={formData.metaKeywords || ""}
              onChange={handleChange}
              placeholder="Enter meta keywords..."
              error={errors.metaKeywords}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription || ""}
                onChange={handleChange}
                placeholder="Enter meta description..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y h-20"
                disabled={isSubmitting}
              />
              {errors.metaDescription && (
                <p className="text-red-500 text-sm">{errors.metaDescription}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-gradient-to-r 
              from-customButton-gradientFrom
              to-customButton-gradientTo
              text-customButton-text
              hover:bg-customButton-hoverBg
              hover:text-customButton-hoverText font-semibold transition"
          >
            {isSubmitting ? "Saving..." : (isEditing ? "Update Product" : "Save Product")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
