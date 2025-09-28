"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { updateUser } from "@/lib/services/customerService"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import FormSelect from "@/components/common/FormSelect"
import FormTextarea from "@/components/common/FormTextarea"
import Loader from "@/components/loading-screen"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserFormData {
  id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  // Removed old address fields
  // address: string
  // city: string
  gender: string
  dob?: string
  orderCount?: number
  lastOrderDate?: string
  wishlistCount?: number
  supportRequestCount?: number
  activityStatus?: string
  notes?: string
  // New address fields
  image?: (string | File)[]
  addressType?: string
  pincode?: string
  state?: string
  houseNo?: string
  roadName?: string
  landmark?: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  // Removed old address fields
  // address?: string
  // city?: string
  gender?: string
  dob?: string
  // New address fields
  addressType?: string
  pincode?: string
  state?: string
  houseNo?: string
  roadName?: string
  landmark?: string
  image?: string
  orderCount?: string
  wishlistCount?: string
  supportRequestCount?: string
  activityStatus?: string
  notes?: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditMode = Boolean(formData.id)

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (isModalVisible) {
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isModalVisible])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "orderCount" || name === "wishlistCount" || name === "supportRequestCount") {
      const num = value === "" ? 0 : Number(value)
      setFormData({ ...formData, [name]: isNaN(num) ? 0 : num })
    } else {
      setFormData({ ...formData, [name]: value })
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Updated validation to reflect new fields and requirements
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName || !formData.firstName.toString().trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName || !formData.lastName.toString().trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.email || !formData.email.toString().trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.phoneNumber || !formData.phoneNumber.toString().trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^\d{10}$/.test(String(formData.phoneNumber).replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Phone number must be 10 digits"
    }
    // Removed old address validation
    // if (!formData.address || !formData.address.toString().trim()) {
    //   newErrors.address = "Address is required"
    // }
    // if (!formData.city || !formData.city.toString().trim()) {
    //   newErrors.city = "City is required"
    // }
    if (!formData.gender) {
      newErrors.gender = "Gender is required"
    }
    if (!formData.dob || !formData.dob.toString().trim()) {
      newErrors.dob = "Date of birth is required"
    }

    // New address field validations
    if (!formData.addressType) {
      newErrors.addressType = "Address type is required"
    }
    if (!formData.pincode || !formData.pincode.toString().trim()) {
      newErrors.pincode = "Pincode is required"
    }
    if (!formData.state || !formData.state.toString().trim()) {
      newErrors.state = "State is required"
    }
    if (!formData.houseNo || !formData.houseNo.toString().trim()) {
      newErrors.houseNo = "House No/Building Name is required"
    }

    if (!formData.activityStatus) {
      newErrors.activityStatus = "Status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setIsLoading(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      setIsLoading(false)
      return
    }

    try {
      // prepare payload with defaults
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        // Removed old address fields
        // address: formData.address,
        // city: formData.city,
        gender: formData.gender,
        dob: formData.dob || "",
        // New address fields
        image: formData.image || [],
        addressType: formData.addressType || "",
        pincode: formData.pincode || "",
        state: formData.state || "",
        houseNo: formData.houseNo || "",
        roadName: formData.roadName || "",
        landmark: formData.landmark || "",
        orderCount: formData.orderCount ?? 0,
        lastOrderDate: formData.lastOrderDate || "",
        wishlistCount: formData.wishlistCount ?? 0,
        supportRequestCount: formData.supportRequestCount ?? 0,
        activityStatus: formData.activityStatus || "inactive",
        notes: formData.notes || "",
        updatedAt: new Date(),
      }

      if (isEditMode) {
        // Use the customer service to update the user with proper image handling
        await updateUser(formData.id!, payload)

        toast({
          title: "Success",
          description: "Customer updated successfully",
        })
      } else {
        payload.createdAt = new Date()
        await addDoc(collection(db, "users"), payload)

        toast({
          title: "Success",
          description: "Customer created successfully",
        })
      }

      onClose()
      getTotalUsers()
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong while saving user",
      })
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const files = Array.from(e.target.files)
    const validFiles: File[] = []

    files.forEach((file) => {
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
    })

    if (validFiles.length > 0) {
      // For customer images, we only allow one image
      // Replace all existing images with the new one
      const newImages = [validFiles[0]] // Only take the first file
      setFormData({ ...formData, image: newImages })

      // Clear image errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    if (!formData.image) return

    const newImages = [...formData.image]
    const removedImage = newImages.splice(index, 1)[0]

    // Revoke the object URL if it's a blob URL
    if (typeof removedImage === "string" && removedImage.startsWith("blob:")) {
      URL.revokeObjectURL(removedImage)
    }

    setFormData({ ...formData, image: newImages })
  }

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]

  const addressTypeOptions = [
    { label: "Home", value: "home" },
    { label: "Office", value: "office" },
    { label: "Other", value: "other" },
  ]

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
      width="60rem"
    >
      {isLoading && <Loader />}

      <div className="py-4">
        {/* Image Upload - full width at the top */}


        {/* Responsive 3-column layout for form fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={isSubmitting}
              multiple={false} // Only allow single file selection
            />

            {/* 🔹 Always show box */}
            <div
              onClick={triggerImageUpload}
              className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer transition-colors
      ${isSubmitting ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"}`}
              style={{ height: "100px", width: "100%" }} // 🔹 Fixed size box
            >
              {formData.image && formData.image.length > 0 ? (
                <div className="flex flex-wrap gap-3 justify-center overflow-auto p-2">
                  {formData.image.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={typeof img === "string" ? img : URL.createObjectURL(img)}
                        alt={`Preview ${index}`}
                        className="h-20 w-20 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        disabled={isSubmitting}
                        title="Remove image"
                      >
                        <svg
                          className="h-4 w-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className={`mx-auto h-12 w-12 ${isSubmitting ? "text-gray-300" : "text-gray-400"}`}
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
                  <p className={`text-sm ${isSubmitting ? "text-gray-400" : "text-gray-600"}`}>
                    {isSubmitting ? "Uploading..." : "Upload Image"}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                </div>
              )}
            </div>

    
          </div>

          {/* First Name */}
          <FormInput
            label="First Name"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            placeholder="Enter first name"
            required
            error={errors.firstName}
          />

          {/* Last Name */}
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            placeholder="Enter last name"
            required
            error={errors.lastName}
          />

          {/* Email */}
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Enter email address"
            required
            error={errors.email}
          />

          {/* Phone Number */}
          <FormInput
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber || ""}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
            error={errors.phoneNumber}
          />

          {/* DOB */}
          <FormInput
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob || ""}
            onChange={handleChange}
            placeholder=""
            required
            error={errors.dob}
          />

          {/* Activity Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.activityStatus || "inactive"}
              onValueChange={(value) => setFormData({ ...formData, activityStatus: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.activityStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.activityStatus}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.gender || ""}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>

          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.addressType || ""}
              onValueChange={(value) => setFormData({ ...formData, addressType: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select address type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.addressType && (
              <p className="mt-1 text-sm text-red-600">{errors.addressType}</p>
            )}
          </div>

          {/* Pincode */}
          <FormInput
            label="Pincode"
            name="pincode"
            value={formData.pincode || ""}
            onChange={handleChange}
            placeholder="Enter pincode"
            required
            error={errors.pincode}
          />

          {/* State */}
          <FormInput
            label="State"
            name="state"
            value={formData.state || ""}
            onChange={handleChange}
            placeholder="Enter state"
            required
            error={errors.state}
          />

          {/* House No/Building Name */}
          <FormInput
            label="House No/Building Name"
            name="houseNo"
            value={formData.houseNo || ""}
            onChange={handleChange}
            placeholder="Enter house number or building name"
            required
            error={errors.houseNo}
          />

          {/* Road Name/Area/Colony/Nearby Famous Mall */}
          <FormInput
            label="Road Name/Area/Colony"
            name="roadName"
            value={formData.roadName || ""}
            onChange={handleChange}
            placeholder="Enter road name, area, colony or nearby famous mall"
            error={errors.roadName}
          />

          {/* Landmark */}
          <FormInput
            label="Nearby Famous Mall/Landmark"
            name="landmark"
            value={formData.landmark || ""}
            onChange={handleChange}
            placeholder="Enter landmark"
            error={errors.landmark}
          />

          {/* Order Count */}
          <FormInput
            label="Order Count"
            name="orderCount"
            type="number"
            value={(formData.orderCount ?? 0).toString()}
            onChange={handleChange}
            placeholder="0"
            // Not required anymore
            error={errors.orderCount}
            min={0}
            step={1}
          />

          {/* Last Order Date */}
          <FormInput
            label="Last Order Date"
            name="lastOrderDate"
            type="date"
            value={formData.lastOrderDate || ""}
            onChange={handleChange}
            placeholder=""
            // Not required anymore
            error={undefined}
          />

          {/* Wishlist Count */}
          <FormInput
            label="Wishlist Count"
            name="wishlistCount"
            type="number"
            value={(formData.wishlistCount ?? 0).toString()}
            onChange={handleChange}
            placeholder="0"
            // Not required anymore
            error={errors.wishlistCount}
            min={0}
            step={1}
          />

          {/* Support Request Count */}
          <FormInput
            label="Support Request Count"
            name="supportRequestCount"
            type="number"
            value={(formData.supportRequestCount ?? 0).toString()}
            onChange={handleChange}
            placeholder="0"
            // Not required anymore
            error={errors.supportRequestCount}
            min={0}
            step={1}
          />
       

          {/* Notes - full width */}
          <div className="md:col-span-3">
   <FormTextarea
            label="Notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            placeholder="Any notes about the customer"
            rows={3}
            // Not required anymore
            error={errors.notes}
          />
          </div>
        </div>
      </div>
    </Modal>
  )
}