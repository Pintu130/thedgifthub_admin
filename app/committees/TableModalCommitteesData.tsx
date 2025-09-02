"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import Loader from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { useCreateCommitteesMutation, useUpdateCommitteesMutation } from "@/lib/redux/features/post/postsApiSlice"
import { Upload } from "lucide-react"
import AdvancedCKEditor from "@/components/common/advanced-ckeditor"


interface CommitteeFormData {
  id?: string
  name: string
  description: string
  image?: File | null
  imagePreview?: string
}

interface FormErrors {
  name?: string
  description?: string
  image?: string
}

interface Props {
  isModalVisible: boolean
  onClose: () => void
  title: string
  closeLabel: string
  saveLabel: string
  formData: CommitteeFormData
  setFormData: (data: CommitteeFormData) => void
  getTotalCommittees: () => void
}

export default function TableModalCommitteesData({
  isModalVisible,
  onClose,
  title,
  closeLabel,
  saveLabel,
  formData,
  setFormData,
  getTotalCommittees,
}: Props) {
  const { toast } = useToast()
  const [createCommittee, { isLoading: isCreating }] = useCreateCommitteesMutation()
  const [updateCommittee, { isLoading: isUpdating }] = useUpdateCommitteesMutation()
  const [errors, setErrors] = useState<FormErrors>({})
  const [editorError, setEditorError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!formData.id

  useEffect(() => {
    if (isModalVisible) {
      setErrors({})
      setEditorError("")
      setIsSubmitting(false)
    }
  }, [isModalVisible])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Handle CKEditor content change
  const handleEditorChange = (_: any, editor: any) => {
    const content = editor.getData()
    setFormData({ ...formData, description: content })

    // Clear description error on change
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }))
    }

    // Validate editor content in real-time
    if (content.trim() === "") {
      setEditorError("Description is required.")
    } else {
      setEditorError("")
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file.",
      })
      return
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
      })
      return
    }

    setFormData({
      ...formData,
      image: file,
      imagePreview: URL.createObjectURL(file),
    })

    // Clear image error
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: undefined }))
    }

    // Reset input value
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  // Trigger file input click
  const triggerImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click()
    }
  }

  // Remove selected image
  const removeImage = () => {
    if (formData.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.imagePreview)
    }
    setFormData({
      ...formData,
      image: null,
      imagePreview: "",
    })
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    // Check if description content is empty (CKEditor might have HTML tags but no actual content)
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = formData.description
    const textContent = tempDiv.textContent || tempDiv.innerText || ""

    if (!textContent.trim()) {
      newErrors.description = "Description is required"
      setEditorError("Description is required.")
    } else {
      setEditorError("")
    }

    // For new committees, image is required
    if (!isEditing && !formData.image) {
      newErrors.image = "Image is required"
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
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("description", formData.description)

      // Only append image if a new file is selected
      if (formData.image) {
        formDataObj.append("image", formData.image)
      }

      let response

      if (isEditing) {
        // Update existing committee
        response = await updateCommittee({
          id: formData.id!,
          formData: formDataObj,
        }).unwrap()

        toast({
          title: "Success",
          description: response?.message || "Committee updated successfully",
        })
      } else {
        // Create new committee
        response = await createCommittee(formDataObj).unwrap()

        toast({
          title: "Success",
          description: response?.message || "Committee created successfully",
        })
      }

      // Clean up blob URL
      if (formData.imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview)
      }

      onClose()
      getTotalCommittees() // Refresh list
    } catch (error: any) {
      const errorMessage = error?.data?.messages || error?.data?.message || error?.error || "Something went wrong"

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview)
      }
    }
  }, [formData.imagePreview])

  const isLoading = isCreating || isUpdating || isSubmitting

  return (
    <Modal
      isOpen={isModalVisible}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={title}
      message=""
      closeLabel={closeLabel}
      confirmLabel={saveLabel}
      isLoading={isLoading}
    >
      {isLoading && <Loader />}

      <div className="space-y-6 py-4">
        {/* Image Upload Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Committee Image {!isEditing && <span className="text-red-500">*</span>}
          </label>

          <div
            className={`border ${errors.image ? "border-red-500" : "border-gray-300 border-dashed"
              } rounded-lg p-6 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[200px]`}
            onClick={triggerImageUpload}
          >
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
            />

            {formData.imagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={formData.imagePreview || "/placeholder.svg"}
                  alt="Committee preview"
                  className="w-full h-48 rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 transition flex items-center justify-center rounded-lg">
                  <Upload className="h-8 w-8 text-white opacity-0 hover:opacity-100" />
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 text-center">
                  Click to upload committee image
                  <br />
                  <span className="text-xs text-gray-400">SVG, PNG, JPG up to 5MB</span>
                </p>
              </>
            )}
          </div>
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
        </div>

        {/* Name Input */}
        <FormInput
          label="Committee Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter committee name"
          required
          error={errors.name}
        />

        {/* Description Input with CKEditor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="max-h-[300px] overflow-y-auto border rounded-md scrollbar-custom">
            <AdvancedCKEditor
              data={formData.description}
              onChange={handleEditorChange}
              placeholder="Type or paste your committee content here!"
              disabled={isLoading}
            />
          </div>
          {(errors.description || editorError) && (
            <p className="text-red-500 text-sm">{errors.description || editorError}</p>
          )}
        </div>
      </div>
    </Modal>
  )
}
