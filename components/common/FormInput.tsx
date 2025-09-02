"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff } from 'lucide-react'

interface FormInputProps {
  label: string
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  type?: "text" | "email" | "number" | "tel" | "password"
  min?: string | number
  max?: string | number
  step?: string | number
}

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  min,
  max,
  step,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPasswordField = type === "password"
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-[#4B3F2F] flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full p-2 ${isPasswordField ? "pr-10" : ""} border ${
            error ? "border-red-500" : "border-[#EADFC8]"
          } rounded-md shadow-sm focus:outline-none focus:ring-focusborderring focus:border-focusborder`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7A6C53] hover:text-customButton-text transition-colors duration-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
