"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useCreateAuthUserMutation, useGetRoleDropdownQuery, useUpdateAuthUserMutation } from "@/lib/redux/features/post/postsApiSlice"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import FormSelect from "@/components/common/FormSelect"
import Loader from "@/components/loading-screen"

// Update the interface to include optional id
interface UserFormData {
    id?: string
    name: string
    email: string
    password: string
    role: string
}

interface FormErrors {
    name?: string
    email?: string
    password?: string
    role?: string
}

interface Props {
    isModalVisible: boolean
    onClose: () => void
    title: string
    closeLabel: string
    saveLabel: string
    formData: UserFormData
    setFormData: (data: UserFormData) => void
    getTotalUsers: () => void
}

export default function TableModalUserList({
    isModalVisible,
    onClose,
    title,
    closeLabel,
    saveLabel,
    formData,
    setFormData,
    getTotalUsers,
}: Props) {
    const { toast } = useToast()
    const [createUser, { isLoading: isCreating }] = useCreateAuthUserMutation()
    const [updateUser, { isLoading: isUpdating }] = useUpdateAuthUserMutation()
    const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoleDropdownQuery()
    const isLoading = isCreating || isUpdating || isRolesLoading
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditMode = Boolean(formData.id)

    // Reset errors when modal opens/closes
    useEffect(() => {
        if (isModalVisible) {
            setErrors({})
            setIsSubmitting(false)
        }
    }, [isModalVisible])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // Clear error for this field when user types
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
        }

        // Password validation - only required for new users
        if (!isEditMode && !formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password && formData.password.length < 6 && formData.password.length > 0) {
            newErrors.password = "Password must be at least 6 characters"
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = "Role is required"
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
            let res

            if (isEditMode) {
                const updateData: any = {
                    id: formData.id,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                }

                if (formData.password) {
                    updateData.password = formData.password
                }

                res = await updateUser(updateData).unwrap()

                toast({
                    title: "Success",
                    description: res?.message || "User updated successfully",
                })
            } else {
                res = await createUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }).unwrap()

                toast({
                    title: "Success",
                    description: res?.message || "User created successfully",
                })
            }

            onClose()
            getTotalUsers()
        } catch (error: any) {

            const errorMessage =
                error?.data?.messages ||
                error?.data?.message ||
                error?.error ||
                "Something went wrong"

            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            })
        } finally {
            setIsSubmitting(false)
        }
    }



    // Role options with label/value pairs for more flexibility
    const roleOptions =
        rolesResponse?.data?.map((role: string) => ({
            label: role,
            value: role,
        })) || []

    return (
        <Modal
            isOpen={isModalVisible}
            onClose={onClose}
            onConfirm={handleSubmit}
            title={title}
            message=""
            closeLabel={closeLabel}
            confirmLabel={saveLabel}
            isLoading={isLoading || isSubmitting}
        >
            {isLoading && <Loader />}
            <div className="!space-y-4  py-4">
                <FormInput
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter user name"
                    required
                    error={errors.name}
                />

                <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    error={errors.email}
                />

                {
                    !isEditMode &&
                    <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                        required={!isEditMode}
                        error={errors.password}
                    />
                }

                <FormSelect
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    options={roleOptions}
                    placeholder="Select user role"
                    required
                    error={errors.role}
                />
            </div>
        </Modal>
    )
}
