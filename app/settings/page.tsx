"use client"
import { useState } from "react"
import type React from "react"

import FormInput from "@/components/common/FormInput"
import { useChangePasswordMutation } from "@/lib/redux/features/post/postsApiSlice"
import { useToast } from "@/hooks/use-toast"
import { Lock, CheckCircle, AlertCircle, LogOut } from "lucide-react"
import RootLayout from "../RootLayout"
import { useAuth } from "@/components/auth-provider"

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const { toast } = useToast()
  const { logout } = useAuth() // Add useAuth hook

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    let valid = true
    const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "" }

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Old password is required"
      valid = false
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
      valid = false
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
      valid = false
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      valid = false
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      toast({
        title: "Success",
        description: res?.messages || "Password changed successfully.",
      });

      // Reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Direct logout after success
      logout();

    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.messages || err?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };


  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "bg-gray-200" }
    if (password.length < 6) return { strength: 25, label: "Weak", color: "bg-red-400" }
    if (password.length < 8) return { strength: 50, label: "Fair", color: "bg-yellow-400" }
    if (password.length < 12) return { strength: 75, label: "Good", color: "bg-blue-400" }
    return { strength: 100, label: "Strong", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <RootLayout>
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-customButton to-customButton-text rounded-full mb-4 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-customButton-text mb-2">Change Password</h1>
          <p className="text-[#7A6C53]">Keep your account secure with a strong password</p>
        </div>

        {/* Security Notice */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <LogOut className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
              <p className="text-xs text-blue-700 mt-1">
                After changing your password, you will be automatically logged out for security purposes.
              </p>
            </div>
          </div>
        </div> */}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-[#EADFC8] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <FormInput
                label="Current Password"
                name="oldPassword"
                type="password"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
                error={errors.oldPassword}
              />
            </div>

            <div className="space-y-4">
              <div>
                <FormInput
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                  error={errors.newPassword}
                />
              </div>
            </div>

            <div>
              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                error={errors.confirmPassword}
              />
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && formData.newPassword && (
              <div
                className={`flex items-center space-x-2 text-sm p-3 rounded-lg transition-all duration-300 ${formData.newPassword === formData.confirmPassword
                    ? "text-green-700 bg-green-50 border border-green-200"
                    : "text-red-700 bg-red-50 border border-red-200"
                  }`}
              >
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <CheckCircle size={16} />
                    <span className="font-medium">Passwords match perfectly!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <span className="font-medium">Passwords do not match</span>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-customButton-text to-[#800000] hover:from-[#800000] hover:to-customButton-text text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </RootLayout>
  )
}
