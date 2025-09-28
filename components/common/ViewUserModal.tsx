"use client"

import Modal from "@/components/common/Modal"
import { X, User, MapPin, FileText, Calendar, ShoppingBag, Heart, MessageCircle, Phone, Mail, Download } from "lucide-react"

interface UserFormData {
  id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: string
  dob?: string
  orderCount?: number
  lastOrderDate?: string
  wishlistCount?: number
  supportRequestCount?: number
  activityStatus?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  image?: string[]
  addressType?: string
  pincode?: string
  state?: string
  houseNo?: string
  roadName?: string
  landmark?: string
}

interface Props {
  user: UserFormData | null
  onClose: () => void
}

export default function ViewUserModal({ user, onClose }: Props) {
  console.log("🚀 ~ ViewUserModal ~ user:", user)
  if (!user) return null

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");   // 19
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 03
    const year = date.getFullYear(); // 2025

    return `${day}/${month}/${year}`;
  };


  // Get address type label
  const getAddressTypeLabel = (type?: string) => {
    switch (type) {
      case "home": return "Home"
      case "office": return "Office"
      case "other": return "Other"
      default: return type || "-"
    }
  }

  // Get status badge style
  const getStatusStyle = (status?: string) => {
    if (status === "active") {
      return "bg-green-100 text-green-800 border-green-200"
    }
    return "bg-red-100 text-red-800 border-red-200"
  }


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#ffeeee] px-8 py-6 border-b border-[#A30000]/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#A30000] rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#A30000]">Customer Details</h2>
                <p className="text-[#A30000] mt-1">
                  ID: <span className="font-mono text-sm">{user.id}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyle(user.activityStatus)}`}>
                {user.activityStatus === "active" ? "Active" : "Inactive"}
              </span>
              <button
                onClick={onClose}
                className="rounded-full hover:bg-[#fff6f6] p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Main Content Grid - Side by Side with equal height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Personal Information */}
              <div className="flex flex-col">
                {/* Personal Profile */}
                <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden flex-1 flex flex-col">
                  <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                    <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#A30000]" />
                      Personal Profile
                    </h3>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Profile Image */}
                      <div className="relative group">
                        <img
                          src={
                            user.image && user.image.length > 0
                              ? user.image[0]
                              : "/dumy.jpg" // public folder માં રાખેલ dummy image
                          }
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#A30000]/30"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#A30000] mb-1">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 font-medium capitalize">
                          {user.gender}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 flex-1">
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <Mail className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Email</div>
                          <div className="text-sm text-gray-800">{user.email || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <Phone className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Phone</div>
                          <div className="text-sm text-gray-800">{user.phoneNumber || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <Calendar className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Date of Birth</div>
                          <div className="text-sm mt-0.5 text-gray-800">{formatDate(user.dob)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Address Information */}
              <div className="flex flex-col">
                {/* Address Details */}
                <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden flex-1 flex flex-col">
                  <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                    <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#A30000]" />
                      Address Details
                    </h3>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <MapPin className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Address Type</div>
                          <div className="text-sm text-gray-800">{getAddressTypeLabel(user.addressType)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <MapPin className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Pincode</div>
                          <div className="text-sm text-gray-800">{user.pincode || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <MapPin className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">State</div>
                          <div className="text-sm text-gray-800">{user.state || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <MapPin className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">House No/Building Name</div>
                          <div className="text-sm text-gray-800">{user.houseNo || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <MapPin className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Road/Area/Colony</div>
                          <div className="text-sm text-gray-800">{user.roadName || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2">
                        <MapPin className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Landmark</div>
                          <div className="text-sm text-gray-800">{user.landmark || "-"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width Section - Combined Order Statistics and Notes */}
            <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
              <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#A30000]" />
                  Order Statistics
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-[#fff6f6] rounded-lg p-4 text-center">
                    <ShoppingBag className="w-6 h-6 text-[#A30000] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#A30000]">{user.orderCount ?? 0}</div>
                    <div className="text-xs text-gray-600">Orders</div>
                  </div>
                  <div className="bg-[#fff6f6] rounded-lg p-4 text-center">
                    <Heart className="w-6 h-6 text-[#A30000] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#A30000]">{user.wishlistCount ?? 0}</div>
                    <div className="text-xs text-gray-600">Wishlist Items</div>
                  </div>
                  <div className="bg-[#fff6f6] rounded-lg p-4 text-center">
                    <MessageCircle className="w-6 h-6 text-[#A30000] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#A30000]">{user.supportRequestCount ?? 0}</div>
                    <div className="text-xs text-gray-600">Support Requests</div>
                  </div>
                  <div className="bg-[#fff6f6] rounded-lg p-4 text-center md:col-span-2">
                    <Calendar className="w-6 h-6 text-[#A30000] mx-auto mb-2" />
                    <div className="text-sm font-bold text-[#A30000]">
                      {user.lastOrderDate ? formatDate(user.lastOrderDate) : "-"}
                    </div>
                    <div className="text-xs text-gray-600">Last Order</div>
                  </div>

                  {/* Notes Section */}
                  {user.notes && (
                    <div className="md:col-span-5 mt-4 pt-4 border-t border-[#A30000]/10">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-[#A30000] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium mb-1">Notes</div>
                          <p className="text-gray-800">{user.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[#ffeeee] border-t border-[#A30000]/30 flex justify-end items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#A30000] hover:bg-[#8F0000] text-white rounded-lg font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}