"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useUpdateAttendeeMutation } from "@/lib/redux/features/post/postsApiSlice"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import Loader from "@/components/loading-screen"

interface AttendeeFormData {
  id: string
  firstName: string
  lastName: string
  Institution: string
  primaryAffiliation: string
  phone: number
  streetAddress: string
  city: string
  state: string
  zipCode: string
  // Non-editable fields (kept for data consistency)
  primaryRoleintheIDeAPrograms: string
  email: string
  cellPhone: number
  termsAndConditions: string
  foodAndMealPlanning: {
    vegetarian: boolean
    allergies: string[]
  }
  registrationDetails: {
    track: string
    ticketType: string
  }
  preConferenceEvents: number[]
  awardSponsorship: number[]
  discountCoupon: string
  actualAmount: number
  createdAt: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  Institution?: string
  primaryAffiliation?: string
  phone?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
}

interface AttendeeEditModalProps {
  isModalVisible: boolean
  onClose: () => void
  formData: AttendeeFormData
  setFormData: React.Dispatch<React.SetStateAction<AttendeeFormData>>
  refreshAttendees: () => void
}

const AttendeeEditModal: React.FC<AttendeeEditModalProps> = ({
  isModalVisible,
  onClose,
  formData,
  setFormData,
  refreshAttendees,
}) => {
  const { toast } = useToast()
  const [updateAttendee, { isLoading }] = useUpdateAttendeeMutation()
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isModalVisible) {
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isModalVisible])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }))

    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.Institution.trim()) {
      newErrors.Institution = "Institution is required"
    }

    if (!formData.primaryAffiliation.trim()) {
      newErrors.primaryAffiliation = "Primary affiliation is required"
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    } else if (formData.phone.toString().length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits"
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required"
    } else if (formData.streetAddress.trim().length < 2) {
      newErrors.streetAddress = "Street address is too short"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required"
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required"
    } else if (!/^\d{6}(-\d{5})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid zip code format"
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
      // Only send the editable fields
      const updateData = {
        id: formData.id,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        Institution: formData.Institution.trim(),
        primaryAffiliation: formData.primaryAffiliation.trim(),
        phone: formData.phone,
        streetAddress: formData.streetAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        // Keep existing values for non-editable fields
        email: formData.email,
        cellPhone: formData.cellPhone,
        primaryRoleintheIDeAPrograms: formData.primaryRoleintheIDeAPrograms,
        termsAndConditions: formData.termsAndConditions,
        foodAndMealPlanning: formData.foodAndMealPlanning,
        registrationDetails: formData.registrationDetails,
        preConferenceEvents: formData.preConferenceEvents,
        awardSponsorship: formData.awardSponsorship,
        discountCoupon: formData.discountCoupon,
        actualAmount: formData.actualAmount,
      }

      const response = await updateAttendee(updateData).unwrap()
      toast({
        title: "Success",
        description: response.message || "Attendee updated successfully",
      })
      refreshAttendees()
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.data?.message || error?.error || "Failed to update attendee",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <Modal
      isOpen={isModalVisible}
      onClose={onClose}
      onConfirm={handleSubmit}
      title="Edit Attendee"
      closeLabel="Cancel"
      confirmLabel="Update Attendee"
      isLoading={isFormLoading}
    >
      {isFormLoading && <Loader />}

      <div className="space-y-6 py-4">
        {/* Personal Information */}
        <div className="!space-y-4">
          <h4 className="text-lg font-medium text-[#4B3F2F] border-b pb-2">Personal Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              required
              error={errors.firstName}
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              required
              error={errors.lastName}
            />
          </div>

          <FormInput
            label="Institution"
            name="Institution"
            value={formData.Institution}
            onChange={handleInputChange}
            placeholder="Enter institution name"
            required
            error={errors.Institution}
          />

          <FormInput
            label="Primary Affiliation"
            name="primaryAffiliation"
            value={formData.primaryAffiliation}
            onChange={handleInputChange}
            placeholder="Enter primary affiliation"
            required
            error={errors.primaryAffiliation}
          />
        </div>

        {/* Contact Information */}
        <div className="!space-y-4">
          <h4 className="text-lg font-medium text-[#4B3F2F] border-b pb-2">Contact Information</h4>

          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
            error={errors.phone}
          />
        </div>

        {/* Address Information */}
        <div className="!space-y-4">
          <h4 className="text-lg font-medium text-[#4B3F2F] border-b pb-2">Address Information</h4>

          <FormInput
            label="Street Address"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            placeholder="Enter street address"
            required
            error={errors.streetAddress}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter city"
              required
              error={errors.city}
            />
            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="Enter state"
              required
              error={errors.state}
            />
            <FormInput
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="Enter zip code"
              required
              error={errors.zipCode}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AttendeeEditModal
