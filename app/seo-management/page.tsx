"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import RootLayout from "../RootLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import FormInput from "@/components/common/FormInput"
import FormSelect from "@/components/common/FormSelect"
import { SEO_PAGES, SEOData, useLazyGetSEODataQuery, useUpdateSEODataMutation } from "@/lib/redux/features/post/postsApiSlice"
import Loader from "@/components/loading-screen"

const SEOManagementPage = () => {
    const { toast } = useToast()
    const [selectedPage, setSelectedPage] = useState<string>("")
    const [currentSEOData, setCurrentSEOData] = useState<SEOData | null>(null)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        id: "",
        page: "",
        title: "",
        description: "",
    })

    // Image upload state
    const [image, setImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imageError, setImageError] = useState("")
    const imageInputRef = useRef<HTMLInputElement>(null)

    // API hooks
    const [getSEOData, { isLoading: isLoadingData }] = useLazyGetSEODataQuery()
    const [updateSEOData, { isLoading: isUpdating }] = useUpdateSEODataMutation()


    const isProcessing = isLoadingData || isUpdating

    // Load data when page selection changes
    useEffect(() => {
        if (selectedPage) {
            loadPageData(selectedPage)
        }
    }, [selectedPage])

    const loadPageData = async (pageName: string) => {
        try {
            const result = await getSEOData(pageName).unwrap()

            if (result.data && result.data.length > 0) {
                const seoData = result.data[0]
                setCurrentSEOData(seoData)
                setFormData({
                    id: seoData._id,
                    page: seoData.page || "",
                    title: seoData.title || "",
                    description: seoData.description || "",
                })
                setImage(seoData.image || null)
                setImageFile(null)
                setImageError("")
                setShowForm(true)
            } else {
                // No data found for this page
                setCurrentSEOData(null)
                setFormData({ id: "", page: pageName, title: "", description: "" })
                setImage(null)
                setImageFile(null)
                setImageError("")
                setShowForm(true)

                toast({
                    variant: "destructive",
                    title: "No Data Found",
                    description: `No SEO data found for ${pageName} page`,
                })
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error?.data?.message || "Failed to load SEO data",
            })
            setShowForm(false)
        }
    }

    // Handle input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    // Handle select change
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target
        setSelectedPage(value)
        setShowForm(false) // Hide form until data loads
    }

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setImageFile(file)
        setImage(URL.createObjectURL(file))
        setImageError("")

        if (imageInputRef.current) {
            imageInputRef.current.value = ""
        }
    }

    // Trigger file input click
    const triggerImageUpload = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click()
        }
    }

    // Validate form before submission
    const validateForm = () => {
        let isValid = true

        if (!image && !imageFile) {
            setImageError("Image is required")
            isValid = false
        }

        if (!formData.title.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Title is required",
            })
            isValid = false
        }

        if (!formData.description.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Description is required",
            })
            isValid = false
        }

        return isValid
    }

    // Check if form is valid for enabling/disabling save button
    const isFormValid =
        formData.title.trim() !== "" && formData.description.trim() !== "" && (imageFile !== null || image !== null)

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        if (!currentSEOData?._id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No SEO data found to update",
            })
            return
        }

        try {
            const formDataObj = new FormData()

            // Append text fields
            formDataObj.append("page", formData.page)
            formDataObj.append("title", formData.title)
            formDataObj.append("description", formData.description)

            // Append image file if it exists
            if (imageFile) {
                formDataObj.append("image", imageFile)
            } else if (image) {
                formDataObj.append("image", image)
            }

            const response = await updateSEOData({
                id: formData.id,
                formData: formDataObj,
            }).unwrap()

            // Clean up blob URLs
            if (imageFile && image?.startsWith("blob:")) {
                URL.revokeObjectURL(image)
            }

            // Reset file state
            setImageFile(null)

            // Update with server data
            if (response.data) {
                setImage(response.data.image || null)
                setCurrentSEOData(response.data)
            }

            toast({
                title: "Success",
                description: response.message || "SEO data updated successfully",
            })
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
            if (image?.startsWith("blob:")) {
                URL.revokeObjectURL(image)
            }
        }
    }, [image])

    return (
        <RootLayout>
            <div className="h-full bg-bgheadersidebar overflow-hidden">
                <div className="h-full overflow-y-auto px-3">

                    {(isLoadingData || isProcessing) && <Loader />}
                    <div>
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold tracking-tight text-customButton-text">SEO Management</h1>
                            <p className="text-muted-foreground text-[#7A6C53] mt-1">Manage SEO settings for all website pages</p>
                        </div>

                        {/* Page Selection Card */}
                        <Card className="border-bordercolor shadow-lg mb-6 bg-white">
                            <CardContent className="p-6">
                                <FormSelect
                                    label="Select Page"
                                    name="page"
                                    value={selectedPage}
                                    onChange={handleSelectChange}
                                    options={SEO_PAGES.slice()}
                                    placeholder="Choose a page to manage SEO settings"
                                    required
                                />
                            </CardContent>
                        </Card>

                        {/* Loading State */}
                        {isProcessing && !showForm ? (
                            <></>
                        ) : !selectedPage ? (
                            <Card className="border-bordercolor shadow-lg bg-white">
                                <CardContent className="p-8">
                                    <div className="text-center py-12">
                                        <AlertCircle className="h-16 w-16 text-sponsor-text mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-customButton-text mb-2">Select a Page to Get Started</h3>
                                        <p className="text-sponsor-hoverText">
                                            Choose a page from the dropdown above to manage its SEO settings
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : showForm ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Page Header */}
                                <div className="bg-gradient-to-r from-customButton-gradientFrom to-customButton-gradientTo p-6 rounded-lg shadow-md">
                                    <h2 className="text-2xl font-semibold text-customButton-text">{selectedPage} Page - SEO Settings</h2>
                                    <p className="text-customButton-hoverText mt-1">
                                        Configure SEO metadata for better search engine visibility
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Image Upload */}
                                    <Card className="border-bordercolor shadow-lg bg-white">
                                        <CardContent className="p-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="image" className="text-sm font-medium text-[#4B3F2F] flex items-center">
                                                    Image <span className="text-red-500 ml-1">*</span>
                                                </Label>
                                                <div
                                                    className={`border-2 ${imageError ? "border-red-500" : "border-bordercolor border-dashed"
                                                        } rounded-lg p-6 hover:bg-sponsor-silver hover:border-focusborder transition-all duration-200 cursor-pointer flex flex-col items-center justify-center h-64`}
                                                    onClick={triggerImageUpload}
                                                >
                                                    <input
                                                        type="file"
                                                        id="image"
                                                        ref={imageInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />

                                                    {image ? (
                                                        <div className="relative w-full h-full">
                                                            <img
                                                                src={image || "/placeholder.svg"}
                                                                alt="SEO image preview"
                                                                className="object-contain w-full h-full rounded"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 transition flex items-center justify-center rounded">
                                                                <Upload className="h-8 w-8 text-white opacity-0 hover:opacity-100" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-12 w-12 text-sponsor-text mb-3" />
                                                            <p className="text-sponsor-text text-center font-medium">Click to upload SEO image</p>
                                                            <p className="text-sponsor-hoverText text-sm text-center mt-1">
                                                                PNG, JPG, GIF up to 10MB
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Title and Description */}
                                    <Card className="border-bordercolor shadow-lg bg-white">
                                        <CardContent className="p-6">
                                            <div className="space-y-6">
                                                <FormInput
                                                    label="Title"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter SEO title"
                                                    required
                                                    error={formData.title.trim() === "" ? "Title is required" : ""}
                                                />

                                                <div className="space-y-2">
                                                    <Label htmlFor="description" className="text-sm font-medium text-[#4B3F2F] flex items-center">
                                                        Description <span className="text-red-500 ml-1">*</span>
                                                    </Label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter SEO description"
                                                        rows={4}
                                                        className={`w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-focusborderring focus:border-focusborder ${formData.description.trim() === "" ? "border-red-500" : "border-[#EADFC8]"
                                                            } bg-white`}
                                                    />
                                                    {formData.description.trim() === "" && (
                                                        <p className="text-red-500 text-sm">Description is required</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Save Button */}
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isProcessing || !isFormValid}
                                            className={`bg-gradient-to-r from-customButton-gradientFrom to-customButton-gradientTo text-customButton-text hover:bg-customButton-hoverBg hover:text-customButton-hoverText transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 p-6 rounded-lg font-semibold ${isProcessing || !isFormValid ? "cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="mr-1 h-5 w-5 animate-spin" />
                                                    Saving SEO Settings...
                                                </>
                                            ) : (
                                                "Save SEO Settings"
                                            )}
                                        </Button>
                                    </div>
                            </form>
                        ) : (
                            <Loader />
                        )}

                    </div>
                </div>
            </div>
        </RootLayout>
    )
}

export default SEOManagementPage
