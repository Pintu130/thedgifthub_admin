// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useToast } from "@/hooks/use-toast"
// import { collection, addDoc, updateDoc, doc } from "firebase/firestore"
// import { db } from "@/lib/firebase"
// import Modal from "@/components/common/Modal"
// import FormInput from "@/components/common/FormInput"
// import FormSelect from "@/components/common/FormSelect"
// import FormTextarea from "@/components/common/FormTextarea"
// import Loader from "@/components/loading-screen"

// interface UserFormData {
//   id?: string
//   firstName: string
//   lastName: string
//   email: string
//   phoneNumber: string
//   address: string
//   city: string
//   gender: string
// }

// interface FormErrors {
//   firstName?: string
//   lastName?: string
//   email?: string
//   phoneNumber?: string
//   address?: string
//   city?: string
//   gender?: string
// }

// interface Props {
//   isModalVisible: boolean
//   onClose: () => void
//   title: string
//   closeLabel: string
//   saveLabel: string
//   formData: UserFormData
//   setFormData: (data: UserFormData) => void
//   getTotalUsers: () => void
// }

// export default function TableModalUserList({
//   isModalVisible,
//   onClose,
//   title,
//   closeLabel,
//   saveLabel,
//   formData,
//   setFormData,
//   getTotalUsers,
// }: Props) {
//   const { toast } = useToast()
//   const [isLoading, setIsLoading] = useState(false)
//   const [errors, setErrors] = useState<FormErrors>({})
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const isEditMode = Boolean(formData.id)

//   // Reset errors when modal opens/closes
//   useEffect(() => {
//     if (isModalVisible) {
//       setErrors({})
//       setIsSubmitting(false)
//     }
//   }, [isModalVisible])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData({ ...formData, [name]: value })

//     // Clear error for this field when user types
//     if (errors[name as keyof FormErrors]) {
//       setErrors((prev) => ({ ...prev, [name]: undefined }))
//     }
//   }

//   const validateForm = (): boolean => {
//     const newErrors: FormErrors = {}

//     if (!formData.firstName.trim()) {
//       newErrors.firstName = "First name is required"
//     }

//     if (!formData.lastName.trim()) {
//       newErrors.lastName = "Last name is required"
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required"
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid"
//     }

//     if (!formData.phoneNumber.trim()) {
//       newErrors.phoneNumber = "Phone number is required"
//     } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
//       newErrors.phoneNumber = "Phone number must be 10 digits"
//     }

//     if (!formData.address.trim()) {
//       newErrors.address = "Address is required"
//     }

//     if (!formData.city.trim()) {
//       newErrors.city = "City is required"
//     }

//     if (!formData.gender) {
//       newErrors.gender = "Gender is required"
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async () => {
//     setIsSubmitting(true)
//     setIsLoading(true)

//     if (!validateForm()) {
//       setIsSubmitting(false)
//       setIsLoading(false)
//       return
//     }

//     try {
//       if (isEditMode) {
//         const userRef = doc(db, "users", formData.id!)
//         await updateDoc(userRef, {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email,
//           phoneNumber: formData.phoneNumber,
//           address: formData.address,
//           city: formData.city,
//           gender: formData.gender,
//           updatedAt: new Date(),
//         })

//         toast({
//           title: "Success",
//           description: "Customer updated successfully",
//         })
//       } else {
//         await addDoc(collection(db, "users"), {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email,
//           phoneNumber: formData.phoneNumber,
//           address: formData.address,
//           city: formData.city,
//           gender: formData.gender,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         })

//         toast({
//           title: "Success",
//           description: "User created successfully",
//         })
//       }

//       onClose()
//       getTotalUsers()
//     } catch (error: any) {
//       console.error("Error saving user:", error)
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Something went wrong while saving user",
//       })
//     } finally {
//       setIsSubmitting(false)
//       setIsLoading(false)
//     }
//   }

//   const genderOptions = [
//     { label: "Male", value: "male" },
//     { label: "Female", value: "female" },
//     { label: "Other", value: "other" },
//   ]

//   return (
//     <Modal
//   isOpen={isModalVisible}
//   onClose={onClose}
//   onConfirm={handleSubmit}
//   title={title}
//   message=""
//   closeLabel={closeLabel}
//   confirmLabel={saveLabel}
//   isLoading={isLoading || isSubmitting}
//   width="60rem" // wider modal for 2-column layout
// >
//   {isLoading && <Loader />}

//   <div className="py-4">
//     {/* Responsive 2-column layout */}
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
//       {/* First Name */}
//       <FormInput
//         label="First Name"
//         name="firstName"
//         value={formData.firstName}
//         onChange={handleChange}
//         placeholder="Enter first name"
//         required
//         error={errors.firstName}
//       />

//       {/* Last Name */}
//       <FormInput
//         label="Last Name"
//         name="lastName"
//         value={formData.lastName}
//         onChange={handleChange}
//         placeholder="Enter last name"
//         required
//         error={errors.lastName}
//       />

//       {/* Email */}
//       <FormInput
//         label="Email"
//         name="email"
//         type="email"
//         value={formData.email}
//         onChange={handleChange}
//         placeholder="Enter email address"
//         required
//         error={errors.email}
//       />

//       {/* Phone Number */}
//       <FormInput
//         label="Phone Number"
//         name="phoneNumber"
//         type="tel"
//         value={formData.phoneNumber}
//         onChange={handleChange}
//         placeholder="Enter phone number"
//         required
//         error={errors.phoneNumber}
//       />

//       {/* Address - full width */}
//       <div className="md:col-span-2">
//         <FormTextarea
//           label="Address"
//           name="address"
//           value={formData.address}
//           onChange={handleChange}
//           placeholder="Enter full address"
//           required
//           error={errors.address}
//           rows={3}
//         />
//       </div>

//       {/* City */}
//       <FormInput
//         label="City"
//         name="city"
//         value={formData.city}
//         onChange={handleChange}
//         placeholder="Enter city"
//         required
//         error={errors.city}
//       />

//       {/* Gender */}
//       <FormSelect
//         label="Gender"
//         name="gender"
//         value={formData.gender}
//         onChange={handleChange}
//         options={genderOptions}
//         placeholder="Select gender"
//         required
//         error={errors.gender}
//       />
//     </div>
//   </div>
// </Modal>

//   )
// }


// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useToast } from "@/hooks/use-toast"
// import { collection, addDoc, updateDoc, doc } from "firebase/firestore"
// import { db } from "@/lib/firebase"
// import Modal from "@/components/common/Modal"
// import FormInput from "@/components/common/FormInput"
// import FormSelect from "@/components/common/FormSelect"
// import FormTextarea from "@/components/common/FormTextarea"
// import Loader from "@/components/loading-screen"

// interface UserFormData {
//   id?: string
//   firstName: string
//   lastName: string
//   email: string
//   phoneNumber: string
//   address: string
//   city: string
//   gender: string
//   dateOfBirth?: string
//   orderCount?: number
//   lastOrderDate?: string
//   wishlistCount?: number
//   supportRequestCount?: number
//   activityStatus?: string
//   notes?: string
// }

// interface FormErrors {
//   firstName?: string
//   lastName?: string
//   email?: string
//   phoneNumber?: string
//   address?: string
//   city?: string
//   gender?: string
//   dateOfBirth?: string
//   orderCount?: string
//   wishlistCount?: string
//   supportRequestCount?: string
// }

// interface Props {
//   isModalVisible: boolean
//   onClose: () => void
//   title: string
//   closeLabel: string
//   saveLabel: string
//   formData: UserFormData
//   setFormData: (data: UserFormData) => void
//   getTotalUsers: () => void
// }

// export default function TableModalUserList({
//   isModalVisible,
//   onClose,
//   title,
//   closeLabel,
//   saveLabel,
//   formData,
//   setFormData,
//   getTotalUsers,
// }: Props) {
//   const { toast } = useToast()
//   const [isLoading, setIsLoading] = useState(false)
//   const [errors, setErrors] = useState<FormErrors>({})
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const isEditMode = Boolean(formData.id)

//   // Reset errors when modal opens/closes
//   useEffect(() => {
//     if (isModalVisible) {
//       setErrors({})
//       setIsSubmitting(false)
//     }
//   }, [isModalVisible])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     // For numeric fields convert to number
//     if (name === "orderCount" || name === "wishlistCount" || name === "supportRequestCount") {
//       const num = value === "" ? 0 : Number(value)
//       setFormData({ ...formData, [name]: isNaN(num) ? 0 : num })
//     } else {
//       setFormData({ ...formData, [name]: value })
//     }

//     if (errors[name as keyof FormErrors]) {
//       setErrors((prev) => ({ ...prev, [name]: undefined }))
//     }
//   }

//   const validateForm = (): boolean => {
//     const newErrors: FormErrors = {}

//     if (!formData.firstName.trim()) {
//       newErrors.firstName = "First name is required"
//     }

//     if (!formData.lastName.trim()) {
//       newErrors.lastName = "Last name is required"
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required"
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid"
//     }

//     if (!formData.phoneNumber.trim()) {
//       newErrors.phoneNumber = "Phone number is required"
//     } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
//       newErrors.phoneNumber = "Phone number must be 10 digits"
//     }

//     if (!formData.address.trim()) {
//       newErrors.address = "Address is required"
//     }

//     if (!formData.city.trim()) {
//       newErrors.city = "City is required"
//     }

//     if (!formData.gender) {
//       newErrors.gender = "Gender is required"
//     }

//     // optional validations for numbers
//     if (formData.orderCount !== undefined && (formData.orderCount < 0 || !Number.isFinite(formData.orderCount))) {
//       newErrors.orderCount = "Order count must be a non-negative number"
//     }
//     if (formData.wishlistCount !== undefined && (formData.wishlistCount < 0 || !Number.isFinite(formData.wishlistCount))) {
//       newErrors.wishlistCount = "Wishlist count must be a non-negative number"
//     }
//     if (formData.supportRequestCount !== undefined && (formData.supportRequestCount < 0 || !Number.isFinite(formData.supportRequestCount))) {
//       newErrors.supportRequestCount = "Support ticket count must be a non-negative number"
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async () => {
//     setIsSubmitting(true)
//     setIsLoading(true)

//     if (!validateForm()) {
//       setIsSubmitting(false)
//       setIsLoading(false)
//       return
//     }

//     try {
//       // prepare payload with defaults
//       const payload: any = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phoneNumber: formData.phoneNumber,
//         address: formData.address,
//         city: formData.city,
//         gender: formData.gender,
//         dateOfBirth: formData.dateOfBirth || "",
//         orderCount: formData.orderCount ?? 0,
//         lastOrderDate: formData.lastOrderDate || "",
//         wishlistCount: formData.wishlistCount ?? 0,
//         supportRequestCount: formData.supportRequestCount ?? 0,
//         activityStatus: formData.activityStatus || "inactive",
//         notes: formData.notes || "",
//         updatedAt: new Date(),
//       }

//       if (isEditMode) {
//         const userRef = doc(db, "users", formData.id!)
//         await updateDoc(userRef, payload)

//         toast({
//           title: "Success",
//           description: "Customer updated successfully",
//         })
//       } else {
//         payload.createdAt = new Date()
//         await addDoc(collection(db, "users"), payload)

//         toast({
//           title: "Success",
//           description: "Customer created successfully",
//         })
//       }

//       onClose()
//       getTotalUsers()
//     } catch (error: any) {
//       console.error("Error saving user:", error)
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Something went wrong while saving user",
//       })
//     } finally {
//       setIsSubmitting(false)
//       setIsLoading(false)
//     }
//   }

//   const genderOptions = [
//     { label: "Male", value: "male" },
//     { label: "Female", value: "female" },
//     { label: "Other", value: "other" },
//   ]

//   const statusOptions = [
//     { label: "Active", value: "active" },
//     { label: "Inactive", value: "inactive" },
//   ]

//   return (
//     <Modal
//       isOpen={isModalVisible}
//       onClose={onClose}
//       onConfirm={handleSubmit}
//       title={title}
//       message=""
//       closeLabel={closeLabel}
//       confirmLabel={saveLabel}
//       isLoading={isLoading || isSubmitting}
//       width="60rem"
//     >
//       {isLoading && <Loader />}

//       <div className="py-4">
//         {/* Responsive 2-column layout */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
//           {/* First Name */}
//           <FormInput
//             label="First Name"
//             name="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//             placeholder="Enter first name"
//             required
//             error={errors.firstName}
//           />

//           {/* Last Name */}
//           <FormInput
//             label="Last Name"
//             name="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//             placeholder="Enter last name"
//             required
//             error={errors.lastName}
//           />

//           {/* Email */}
//           <FormInput
//             label="Email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Enter email address"
//             required
//             error={errors.email}
//           />

//           {/* Phone Number */}
//           <FormInput
//             label="Phone Number"
//             name="phoneNumber"
//             type="tel"
//             value={formData.phoneNumber}
//             onChange={handleChange}
//             placeholder="Enter phone number"
//             required
//             error={errors.phoneNumber}
//           />

//           {/* DOB */}
//           <FormInput
//             label="Date of Birth"
//             name="dateOfBirth"
//             type="date"
//             value={formData.dateOfBirth || ""}
//             onChange={handleChange}
//             placeholder=""
//             error={errors.dateOfBirth}
//           />

//           {/* Activity Status */}
//           <FormSelect
//             label="Status"
//             name="activityStatus"
//             value={formData.activityStatus || "inactive"}
//             onChange={handleChange}
//             options={statusOptions}
//             placeholder="Select status"
//           />

//           {/* Address - full width */}
//           <div className="md:col-span-2">
//             <FormTextarea
//               label="Address"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="Enter full address"
//               required
//               error={errors.address}
//               rows={3}
//             />
//           </div>

//           {/* City */}
//           <FormInput
//             label="City"
//             name="city"
//             value={formData.city}
//             onChange={handleChange}
//             placeholder="Enter city"
//             required
//             error={errors.city}
//           />

//           {/* Gender */}
//           <FormSelect
//             label="Gender"
//             name="gender"
//             value={formData.gender}
//             onChange={handleChange}
//             options={genderOptions}
//             placeholder="Select gender"
//             required
//             error={errors.gender}
//           />

//           {/* Order Count */}
//           <FormInput
//             label="Order Count"
//             name="orderCount"
//             type="number"
//             value={(formData.orderCount ?? 0).toString()}
//             onChange={handleChange}
//             placeholder="0"
//             error={errors.orderCount}
//           />

//           {/* Last Order Date */}
//           <FormInput
//             label="Last Order Date"
//             name="lastOrderDate"
//             type="date"
//             value={formData.lastOrderDate || ""}
//             onChange={handleChange}
//             placeholder=""
//           />

//           {/* Wishlist Count */}
//           <FormInput
//             label="Wishlist Count"
//             name="wishlistCount"
//             type="number"
//             value={(formData.wishlistCount ?? 0).toString()}
//             onChange={handleChange}
//             placeholder="0"
//             error={errors.wishlistCount}
//           />

//           {/* Support Request Count */}
//           <FormInput
//             label="Support Request Count"
//             name="supportRequestCount"
//             type="number"
//             value={(formData.supportRequestCount ?? 0).toString()}
//             onChange={handleChange}
//             placeholder="0"
//             error={errors.supportRequestCount}
//           />

//           {/* Notes - full width */}
//           <div className="md:col-span-2">
//             <FormTextarea
//               label="Notes"
//               name="notes"
//               value={formData.notes || ""}
//               onChange={handleChange}
//               placeholder="Any notes about the customer"
//               rows={3}
//             />
//           </div>
//         </div>
//       </div>
//     </Modal>
//   )
// }




"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Modal from "@/components/common/Modal"
import FormInput from "@/components/common/FormInput"
import FormSelect from "@/components/common/FormSelect"
import FormTextarea from "@/components/common/FormTextarea"
import Loader from "@/components/loading-screen"

interface UserFormData {
  id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: string
  city: string
  gender: string
  dob?: string
  orderCount?: number
  lastOrderDate?: string
  wishlistCount?: number
  supportRequestCount?: number
  activityStatus?: string
  notes?: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  address?: string
  city?: string
  gender?: string
  dob?: string
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

  // Require all fields: this enforces form completeness for create/update
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
    if (!formData.address || !formData.address.toString().trim()) {
      newErrors.address = "Address is required"
    }
    if (!formData.city || !formData.city.toString().trim()) {
      newErrors.city = "City is required"
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required"
    }
    if (!formData.dob || !formData.dob.toString().trim()) {
      newErrors.dob = "Date of birth is required"
    }

    // numbers required
    if (formData.orderCount === undefined || String(formData.orderCount).trim() === "") {
      newErrors.orderCount = "Order count is required"
    } else if (!Number.isInteger(formData.orderCount) || formData.orderCount! < 0) {
      newErrors.orderCount = "Order count must be a non-negative integer"
    }

    if (formData.wishlistCount === undefined || String(formData.wishlistCount).trim() === "") {
      newErrors.wishlistCount = "Wishlist count is required"
    } else if (!Number.isInteger(formData.wishlistCount) || formData.wishlistCount! < 0) {
      newErrors.wishlistCount = "Wishlist count must be a non-negative integer"
    }

    if (formData.supportRequestCount === undefined || String(formData.supportRequestCount).trim() === "") {
      newErrors.supportRequestCount = "Support request count is required"
    } else if (!Number.isInteger(formData.supportRequestCount) || formData.supportRequestCount! < 0) {
      newErrors.supportRequestCount = "Support request count must be a non-negative integer"
    }

    if (!formData.activityStatus) {
      newErrors.activityStatus = "Status is required"
    }

    if (!formData.notes || !formData.notes.toString().trim()) {
      newErrors.notes = "Notes are required"
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
        address: formData.address,
        city: formData.city,
        gender: formData.gender,
        dob: formData.dob || "",
        orderCount: formData.orderCount ?? 0,
        lastOrderDate: formData.lastOrderDate || "",
        wishlistCount: formData.wishlistCount ?? 0,
        supportRequestCount: formData.supportRequestCount ?? 0,
        activityStatus: formData.activityStatus || "inactive",
        notes: formData.notes || "",
        updatedAt: new Date(),
      }

      if (isEditMode) {
        const userRef = doc(db, "users", formData.id!)
        await updateDoc(userRef, payload)

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
        description: "Something went wrong while saving user",
      })
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ]

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
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
        {/* Responsive 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
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
          <FormSelect
            label="Status"
            name="activityStatus"
            value={formData.activityStatus || "inactive"}
            onChange={handleChange}
            options={statusOptions}
            placeholder="Select status"
            required
            error={errors.activityStatus}
          />

          {/* Address - full width */}
          <div className="md:col-span-2">
            <FormTextarea
              label="Address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Enter full address"
              required
              error={errors.address}
              rows={3}
            />
          </div>

          {/* City */}
          <FormInput
            label="City"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            placeholder="Enter city"
            required
            error={errors.city}
          />

          {/* Gender */}
          <FormSelect
            label="Gender"
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            options={genderOptions}
            placeholder="Select gender"
            required
            error={errors.gender}
          />

          {/* Order Count */}
          <FormInput
            label="Order Count"
            name="orderCount"
            type="number"
            value={(formData.orderCount ?? 0).toString()}
            onChange={handleChange}
            placeholder="0"
            required
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
            required
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
            required
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
            required
            error={errors.supportRequestCount}
            min={0}
            step={1}
          />

          {/* Notes - full width */}
          <div className="md:col-span-2">
            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Any notes about the customer"
              rows={3}
              required
              error={errors.notes}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
