"use client"

import type React from "react"
import { useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message?: string
  children?: React.ReactNode
  closeLabel?: string
  confirmLabel?: string
  isLoading?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  closeLabel = "Cancel",
  confirmLabel = "Confirm",
  isLoading = false,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[38rem] mx-4 max-h-[70vh] flex flex-col overflow-hidden z-10">
        
        {/* Header (Fixed) */}
        <div className="flex items-center justify-between p-4 border-b border-[#EADFC8]">
          <h3 className="text-lg font-semibold text-[#4B3F2F]">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-4 overflow-y-auto scrollbar-custom flex-1">
          {message && <p className="text-[#4B3F2F] mb-4">{message}</p>}
          {children}
        </div>

        {/* Footer (Fixed) */}
        <div className="flex justify-end gap-2 p-4 border-t border-[#EADFC8]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-customButton-text bg-customButton hover:bg-[#FFD1D1] hover:text-[#800000] rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {closeLabel}
          </button>

          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-customButton-text hover:bg-[#800000] rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
