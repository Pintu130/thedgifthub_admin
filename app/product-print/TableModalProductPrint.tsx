"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ProperFormData {
  id?: string
  title: string
  image: string
  status: "active" | "inactive"
  notes: string
}

interface FormErrors {
  title?: string
  image?: string
  status?: string
  notes?: string
}

interface Props {
  isModalVisible: boolean
  onClose: () => void
  title: string
  closeLabel: string
  saveLabel: string
  formData: ProperFormData
  setFormData: React.Dispatch<React.SetStateAction<ProperFormData>>
  getTotalPropers: () => void
}

export default function TableModalProductPrint({
  isModalVisible,
  onClose,
  title,
  closeLabel,
  saveLabel,
  formData,
  setFormData,
  getTotalPropers,
}: Props) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!formData.id

  useEffect(() => {
    if (isModalVisible) {
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isModalVisible])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors && errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined })
    }
  }

  const handleStatusChange = (value: "active" | "inactive") => {
    setFormData({ ...formData, status: value })

    if (errors && errors.status) {
      setErrors({ ...errors, status: undefined })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const file = e.target.files[0]
    
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

    // For simplicity, we'll just use a preview URL
    const preview = URL.createObjectURL(file)
    setFormData({ ...formData, image: preview })

    if (errors && errors.image) {
      setErrors({ ...errors, image: undefined })
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: "" })
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

    if (!formData.image) {
      newErrors.image = "Image is required"
    }

    if (!formData.notes.trim()) {
      newErrors.notes = "Notes are required"
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
      // In a real app, this would be an API call
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: isEditing ? "Proper updated successfully" : "Proper created successfully",
      })

      onClose()
      getTotalPropers()
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
      // Clean up blob URLs
      if (formData.image && formData.image.startsWith("blob:")) {
        URL.revokeObjectURL(formData.image)
      }
    }
  }, [formData.image])

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
      width="50rem"
    >
      <div className="!space-y-4 p-3">
        {/* Image Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Image <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Upload box */}
            <div
              className={`border ${errors && errors.image ? "border-red-500" : "border-gray-300 border-dashed"
                } rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px] w-full md:w-1/3`}
              onClick={triggerImageUpload}
            >
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
              <Plus className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center">
                Click to upload image
              </p>
            </div>

            {/* Preview */}
            <div className="w-full md:w-2/3">
              {formData.image ? (
                <div className="relative group">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md border border-gray-200"
                    onError={(e: any) =>
                      (e.currentTarget.src = "/placeholder.svg?height=150&width=150")
                    }
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md border border-gray-200">
                  <p className="text-gray-500">No image uploaded</p>
                </div>
              )}
            </div>
          </div>
          
          {errors && errors.image && (
            <p className="text-red-500 text-sm">{errors.image}</p>
          )}
        </div>

        {/* Title and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter title"
            required
            error={errors && errors.title}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>

            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={`w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors && errors.status ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {errors && errors.status && (
              <p className="text-red-500 text-sm">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter notes..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y h-32"
            disabled={isSubmitting}
          />
          {errors && errors.notes && (
            <p className="text-red-500 text-sm">{errors.notes}</p>
          )}
        </div>
      </div>
    </Modal>
  )
}