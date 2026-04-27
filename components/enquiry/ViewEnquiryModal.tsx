"use client"

import { X, User, MapPin, Mail, Phone, MessageSquare, Calendar, Clock } from "lucide-react"
import { Timestamp } from "firebase/firestore"

interface Enquiry {
  id: string
  fullName: string
  city: string
  email: string
  phone: string
  enquiryDetails: string
  status: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

interface ViewEnquiryModalProps {
  enquiry: Enquiry | null
  onClose: () => void
}

export default function ViewEnquiryModal({ enquiry, onClose }: ViewEnquiryModalProps) {
  if (!enquiry) return null

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "-"
    const date = timestamp.toDate()
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-xl mx-4 flex flex-col z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#EADFC8] shrink-0 bg-[#faeaea]">
          <h3 className="text-lg font-semibold text-[#4B3F2F]">Enquiry Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#FFDEDE] transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-[#4B3F2F]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* User Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-customButton-text" />
              <h4 className="font-semibold text-gray-800">Contact Information</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <User size={14} /> Full Name:
                </span>
                <span className="text-sm font-medium text-gray-800">{enquiry.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail size={14} /> Email:
                </span>
                <span className="text-sm font-medium text-gray-800">{enquiry.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone size={14} /> Phone:
                </span>
                <span className="text-sm font-medium text-gray-800">{enquiry.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> City:
                </span>
                <span className="text-sm font-medium text-gray-800">{enquiry.city}</span>
              </div>
            </div>
          </div>

          {/* Enquiry Details */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={18} className="text-customButton-text" />
              <h4 className="font-semibold text-gray-800">Enquiry Details</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Message:</span>
                </div>
                <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap">
                  {enquiry.enquiryDetails || "No details provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-customButton-text" />
              <h4 className="font-semibold text-gray-800">Timestamps</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={14} /> Created At:
                </span>
                <span className="text-sm font-medium text-gray-800">{formatDate(enquiry.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} /> Updated At:
                </span>
                <span className="text-sm font-medium text-gray-800">{formatDate(enquiry.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-[#EADFC8] shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-customButton-text bg-customButton hover:bg-[#FFD1D1] hover:text-[#800000] rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
