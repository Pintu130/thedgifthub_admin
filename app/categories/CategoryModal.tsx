"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Modal from "@/components/common/Modal"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import FormInput from "@/components/common/FormInput"
import Loader from "@/components/loading-screen"

interface Category {
    id?: string
    name: string
    imageUrl: string
    createdAt?: string
    updatedAt?: string
}

interface CategoryFormData {
    name: string
    image: File | null
    imagePreview: string
}

interface FormErrors {
    name?: string
    image?: string
}

interface Props {
    isModalVisible: boolean
    onClose: () => void
    title: string
    closeLabel: string
    saveLabel: string
    formData: CategoryFormData
    setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>
    onRefresh: () => void
    editingId?: string | null
}

export default function CategoryModal({
    isModalVisible,
    onClose,
    title,
    closeLabel,
    saveLabel,
    formData,
    setFormData,
    onRefresh,
    editingId,
}: Props) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isEditing = !!editingId

    useEffect(() => {
        if (isModalVisible) {
            setErrors({})
            setIsSubmitting(false)
        }
    }, [isModalVisible])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, image: "Image size should be less than 2MB" }))
                return
            }

            // Check file type
            if (!file.type.match("image.*")) {
                setErrors((prev) => ({ ...prev, image: "Please select a valid image file" }))
                return
            }

            // Create preview URL
            const previewUrl = URL.createObjectURL(file)

            setFormData((prev) => ({
                ...prev,
                image: file,
                imagePreview: previewUrl,
            }))

            // Clear any previous image errors
            if (errors.image) {
                setErrors((prev) => ({ ...prev, image: undefined }))
            }
        }
    }

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
            imagePreview: "",
        }))
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Category name is required"
        }

        if (!formData.image && !formData.imagePreview) {
            newErrors.image = "Category image is required"
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

        const formDataToSend = new FormData()
        formDataToSend.append("name", formData.name)

        if (formData.image) {
            formDataToSend.append("image", formData.image)
        }

        try {
            let response
            if (isEditing && editingId) {
                // Update existing category
                response = await fetch(`/api/categories/${editingId}`, {
                    method: "PUT",
                    body: formDataToSend,
                })
            } else {
                // Create new category
                response = await fetch("/api/categories", {
                    method: "POST",
                    body: formDataToSend,
                })
            }

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to save category")
            }

            toast({
                title: "Success",
                description: `Category ${isEditing ? "updated" : "created"} successfully`,
            })

            onClose()
            onRefresh()
        } catch (error) {
            console.error("Error saving category:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save category. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
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
            width="32rem"
        >

            {isSubmitting && <Loader />}

            <div className="!space-y-4 p-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Image <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                        disabled={isSubmitting}
                    />

                    {formData.imagePreview ? (
                        <div className="mt-2">
                            <div className="relative">
                                <img
                                    src={formData.imagePreview || "/placeholder.svg"}
                                    alt="Category preview"
                                    className="h-40 w-full object-cover rounded-md border border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                    disabled={isSubmitting}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                        >
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <p className="pl-1">Click to upload an image</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, JPEG (max. 2MB)</p>
                            </div>
                        </div>
                    )}
                    {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>
                <div>
                    <FormInput
                        label="Category Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter category name"
                        required
                        error={errors.name}
                    />

                </div>
            </div>
        </Modal>
    )
}
