"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Modal from "@/components/common/Modal"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface HomeFormData {
  id?: string
  title: string
  subtitle: string
  link: string
  image: File | string | null
  imagePreview?: string
  status: 'active' | 'inactive'
}

interface FormErrors {
  title?: string
  subtitle?: string
  link?: string
  image?: string
  status?: string
}

interface Props {
  isModalVisible: boolean
  onClose: () => void
  title: string
  closeLabel: string
  saveLabel: string
  formData: HomeFormData
  setFormData: React.Dispatch<React.SetStateAction<HomeFormData>>
  isSubmitting?: boolean
  onSubmit: (data: HomeFormData) => Promise<void>
}

export default function HomeModal({
  isModalVisible,
  onClose,
  title,
  closeLabel,
  saveLabel,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
}: Props) {
  const { toast } = useToast()
  const [errors, setErrors] = useState<FormErrors>({})
  const imageInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!formData.id

  useEffect(() => {
    if (isModalVisible) {
      setErrors({})
    }
  }, [isModalVisible])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file.",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image size should be less than 5MB.",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData({
        ...formData,
        image: file,
        imagePreview: event.target?.result as string
      })
    }
    reader.readAsDataURL(file)

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }))
    }
  }

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: ''
    })
  }

  const triggerImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.subtitle.trim()) {
      newErrors.subtitle = "Subtitle is required"
    }

    if (!formData.link.trim()) {
      newErrors.link = "Link is required"
    }

    if (!formData.image) {
      newErrors.image = "Image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
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
      width="60rem"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6 p-4">
          {/* Image Upload Section */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: Upload Box */}
            <div className="w-full lg:w-1/3">
              <label className="block text-sm font-medium text-gray-700">
                Image <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => {
                  if (!isSubmitting) {
                    imageInputRef.current?.click();
                  }
                }}
                className={`mt-1 flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isSubmitting ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  } ${errors.image ? 'border-red-500' : ''}`}
              >
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                {formData.imagePreview || (typeof formData.image === 'string' && formData.image) ? (
                  <div className="relative">
                    <img
                      src={formData.imagePreview || (typeof formData.image === 'string' ? formData.image : '')}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={isSubmitting}
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Plus className={`h-12 w-12 mb-2 ${isSubmitting ? 'text-gray-300' : 'text-gray-400'}`} />
                    <p className={`text-sm text-center ${isSubmitting ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isSubmitting ? 'Uploading...' : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            {/* Right: Form Fields */}
            <div className="w-full lg:w-2/3 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subtitle <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Enter subtitle"
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.subtitle ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="Enter link (e.g., /products, https://example.com)"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.link ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                />
                {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as "active" | "inactive" })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full border rounded-md shadow-sm px-2 py-2 cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  )
}
