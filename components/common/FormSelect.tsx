"use client"

import type React from "react"

interface Option {
  label: string
  value: string
}

interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[] | string[]
  placeholder?: string
  required?: boolean
  error?: string
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  error,
}: FormSelectProps) {
  // Determine if options is an array of strings or Option objects
  const isOptionObject = options.length > 0 && typeof options[0] !== "string"

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-focusborderring focus:border-focusborder ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">{placeholder}</option>
        {isOptionObject
          ? (options as Option[]).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : (options as string[]).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
