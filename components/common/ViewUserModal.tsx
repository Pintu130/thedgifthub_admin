"use client"

import Modal from "@/components/common/Modal"

interface UserFormData {
  id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: string
  city: string
  gender: string
  dateOfBirth?: string // ISO date string like "1990-01-01"
  orderCount?: number
  lastOrderDate?: string // ISO date string
  wishlistCount?: number
  supportRequestCount?: number
  activityStatus?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface Props {
  user: UserFormData | null
  onClose: () => void
}

export default function ViewUserModal({ user, onClose }: Props) {
  if (!user) return null

  // hide createdAt & updatedAt
  const { createdAt, updatedAt,id, ...visibleFields } = user

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Customer Details"
      message=""
      closeLabel="Close"
      confirmLabel="" // no confirm button
      width="60rem"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 text-gray-700">
        {Object.entries(visibleFields).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <span className="font-semibold capitalize">
              {key.replace(/([A-Z])/g, " $1")}:{" "}
            </span>
            <span>{value ? String(value) : "-"}</span>
          </div>
        ))}
      </div>
    </Modal>
  )
}
