"use client"

import { useState } from "react"
import { X, User, MapPin, Mail, Phone, MessageSquare, Calendar, Clock, Copy, Check } from "lucide-react"
import { Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!enquiry) return null

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy to clipboard",
      })
    }
  }

  const copyAllContactInfo = async () => {
    const contactInfo = `Name: ${enquiry.fullName}
Email: ${enquiry.email}
Phone: ${enquiry.phone}
City: ${enquiry.city}`
    await copyToClipboard(contactInfo, "All Contact Info")
  }

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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-customButton-text" />
                <h4 className="font-semibold text-gray-800">Contact Information</h4>
              </div>
              <button
                onClick={copyAllContactInfo}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-customButton-text bg-customButton hover:bg-[#FFD1D1] hover:text-[#800000] rounded-md transition-colors"
                title="Copy all contact info"
              >
                <Copy size={14} />
                Copy All
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <User size={14} /> Full Name:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{enquiry.fullName}</span>
                  <button
                    onClick={() => copyToClipboard(enquiry.fullName, "Full Name")}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Copy Full Name"
                  >
                    {copiedField === "Full Name" ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail size={14} /> Email:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{enquiry.email}</span>
                  <button
                    onClick={() => copyToClipboard(enquiry.email, "Email")}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Copy Email"
                  >
                    {copiedField === "Email" ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone size={14} /> Phone:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{enquiry.phone}</span>
                  <button
                    onClick={() => copyToClipboard(enquiry.phone, "Phone")}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Copy Phone"
                  >
                    {copiedField === "Phone" ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> City:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{enquiry.city}</span>
                  <button
                    onClick={() => copyToClipboard(enquiry.city, "City")}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Copy City"
                  >
                    {copiedField === "City" ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
                  </button>
                </div>
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
