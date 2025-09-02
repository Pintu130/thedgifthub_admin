"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import RootLayout from "../RootLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useGetMainHeadingQuery, useUpdateMainHeadingMutation } from "@/lib/redux/features/post/postsApiSlice"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import Loader from "@/components/loading-screen"
import FormInput from "@/components/common/FormInput"

const HeroSectionPage = () => {
  const { data, isLoading, isError, refetch } = useGetMainHeadingQuery()
  const [updateMainHeading, { isLoading: isUpdating }] = useUpdateMainHeadingMutation()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    buttonName: "",
    description: "",
    subDescription: "",
    date: "",
  })

  // Image upload state
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [subImage, setSubImage] = useState<string | null>(null)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [subImageFile, setSubImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState("")
  const [subImageError, setSubImageError] = useState("")

  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const subImageInputRef = useRef<HTMLInputElement>(null)


  const isProcessing = isLoading || isUpdating

  // Load data when available
  useEffect(() => {
    if (data?.data?.[0]) {
      const mainHeadingData = data.data[0]
      setFormData({
        id: mainHeadingData._id,
        buttonName: mainHeadingData.buttonName || "",
        description: mainHeadingData.description || "",
        subDescription: mainHeadingData.subDescription || "",
        date: mainHeadingData.date || "",
      })

      // Set image previews
      if (mainHeadingData.image) {
        setMainImage(mainHeadingData.image)
        setImageError("")
      }
      if (mainHeadingData.subImage) {
        setSubImage(mainHeadingData.subImage)
        setSubImageError("")
      }
    }
  }, [data])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle main image selection
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file.",
      })
      return
    }

    setMainImageFile(file)
    setMainImage(URL.createObjectURL(file))
    setImageError("")

    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = ""
    }
  }

  // Handle sub image selection
  const handleSubImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file.",
      })
      return
    }

    setSubImageFile(file)
    setSubImage(URL.createObjectURL(file))
    setSubImageError("")

    if (subImageInputRef.current) {
      subImageInputRef.current.value = ""
    }
  }

  // Trigger file input click
  const triggerMainImageUpload = () => {
    if (mainImageInputRef.current) {
      mainImageInputRef.current.click()
    }
  }

  const triggerSubImageUpload = () => {
    if (subImageInputRef.current) {
      subImageInputRef.current.click()
    }
  }

  // Validate form before submission
  const validateForm = () => {
    let isValid = true

    // Validate images
    if (!mainImage && !mainImageFile) {
      setImageError("Main image is required")
      isValid = false
    }

    if (!subImage && !subImageFile) {
      setSubImageError("Sub image is required")
      isValid = false
    }

    return isValid
  }

  // Check if form is valid for enabling/disabling save button
  const isFormValid =
    formData.buttonName.trim() !== "" &&
    formData.description.trim() !== "" &&
    formData.subDescription.trim() !== "" &&
    formData.date.trim() !== "" &&
    (mainImageFile !== null || mainImage !== null) &&
    (subImageFile !== null || subImage !== null)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      })
      return
    }

    try {
      const formDataObj = new FormData()

      // Append text fields
      formDataObj.append("buttonName", formData.buttonName)
      formDataObj.append("description", formData.description)
      formDataObj.append("subDescription", formData.subDescription)
      formDataObj.append("date", formData.date)

      // Append image files if they exist
      if (mainImageFile) {
        formDataObj.append("image", mainImageFile)
      } else if (mainImage) {
        formDataObj.append("image", mainImage)
      }

      if (subImageFile) {
        formDataObj.append("subImage", subImageFile)
      } else if (subImage) {
        formDataObj.append("subImage", subImage)
      }

      const response = await updateMainHeading({
        id: formData.id,
        formData: formDataObj,
      }).unwrap()

      // Clean up blob URLs
      if (mainImageFile && mainImage?.startsWith("blob:")) {
        URL.revokeObjectURL(mainImage)
      }
      if (subImageFile && subImage?.startsWith("blob:")) {
        URL.revokeObjectURL(subImage)
      }

      // Reset file states
      setMainImageFile(null)
      setSubImageFile(null)

      // Update with server data
      if (response.data) {
        setMainImage(response.data.image || null)
        setSubImage(response.data.subImage || null)
      }

      toast({
        title: "Success",
        description: response.message || "Hero section updated successfully",
      })

      refetch()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.data?.message || "Something went wrong",
      })
      console.error("Update failed", error)
    }
  }

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (mainImage?.startsWith("blob:")) {
        URL.revokeObjectURL(mainImage)
      }
      if (subImage?.startsWith("blob:")) {
        URL.revokeObjectURL(subImage)
      }
    }
  }, [mainImage, subImage])

  return (
    <RootLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-customButton-text">Hero Section Management</h1>
        {isProcessing && <Loader />}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>Failed to load hero section content. Please try refreshing the page.</p>
          </div>
        )}
        
        {!isLoading && !isError && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-[#EADFC8] shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Image Upload */}
                  <div className="space-y-1">
                    <Label htmlFor="mainImage" className="text-sm font-medium text-[#4B3F2F] flex items-center">
                      Main Image <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div
                      className={`border-2 ${imageError ? "border-red-500" : "border-[#EADFC8] border-dashed"} rounded-md p-4 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center h-64`}
                      onClick={triggerMainImageUpload}
                    >
                      <input
                        type="file"
                        id="mainImage"
                        ref={mainImageInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />

                      {mainImage ? (
                        <div className="relative w-full h-full">
                          <img
                            src={mainImage || "/placeholder.svg"}
                            alt="Main image preview"
                            className="object-contain w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition flex items-center justify-center">
                            <Upload className="h-8 w-8 text-white opacity-0 hover:opacity-100" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload main image</p>
                        </>
                      )}
                    </div>
                    {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
                  </div>

                  {/* Sub Image Upload */}
                  <div className="space-y-1">
                    <Label htmlFor="subImage" className="text-sm font-medium text-[#4B3F2F] flex items-center">
                      Sub Image <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div
                      className={`border-2 ${subImageError ? "border-red-500" : "border-[#EADFC8] border-dashed"} rounded-md p-4 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center h-64`}
                      onClick={triggerSubImageUpload}
                    >
                      <input
                        type="file"
                        id="subImage"
                        ref={subImageInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleSubImageChange}
                      />

                      {subImage ? (
                        <div className="relative w-full h-full">
                          <img
                            src={subImage || "/placeholder.svg"}
                            alt="Sub image preview"
                            className="object-contain w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition flex items-center justify-center">
                            <Upload className="h-8 w-8 text-white opacity-0 hover:opacity-100" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload sub image</p>
                        </>
                      )}
                    </div>
                    {subImageError && <p className="text-red-500 text-xs mt-1">{subImageError}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#EADFC8] shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Button Name */}
                  <FormInput
                    label="Button Name"
                    name="buttonName"
                    value={formData.buttonName}
                    onChange={handleInputChange}
                    placeholder="Enter button name"
                    required
                    error={formData.buttonName.trim() === "" ? "Button name is required" : ""}
                  />

                  {/* Date Input */}
                  <FormInput
                    label="Date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    placeholder="Enter date"
                    required
                    error={formData.date.trim() === "" ? "Date is required" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#EADFC8] shadow-sm">
              <CardContent className="pt-6">
                <div className="!space-y-4">
                  {/* Description */}
                  <FormInput
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    required
                    error={formData.description.trim() === "" ? "Description is required" : ""}
                  />

                  {/* Sub Description */}
                  <FormInput
                    label="Sub Description"
                    name="subDescription"
                    value={formData.subDescription}
                    onChange={handleInputChange}
                    placeholder="Enter sub description"
                    required
                    error={formData.subDescription.trim() === "" ? "Sub description is required" : ""}
                  />
                </div>
              </CardContent>
            </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isProcessing || !isFormValid}
                  className={`bg-gradient-to-r  
                  from-customButton-gradientFrom
                  to-customButton-gradientTo
                  text-customButton-text
                  hover:bg-customButton-hoverBg
                  hover:text-customButton-hoverText
                  transition-all duration-200 shadow-md hover:shadow-lg
                  disabled:opacity-50 px-6 py-2 rounded-md
                  ${isProcessing || !isFormValid ? "cursor-not-allowed" : ""}
                `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
          </form>
        )}
      </div>
    </RootLayout>
  )
}

export default HeroSectionPage
