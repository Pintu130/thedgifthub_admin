"use client"

import type React from "react"

interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  rows?: number
  className?: string
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  rows = 3,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-[#4B3F2F]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-customButton-gradientFrom focus:border-customButton-gradientFrom resize-vertical ${
          error ? "border-red-500" : "border-[#EADFC8]"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={disabled}
        required={required}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

export default FormTextarea
