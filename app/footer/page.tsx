"use client"
import { useEffect, useState, useRef } from "react"
import type React from "react"
import RootLayout from "../RootLayout"
import {
  useGetFooterContentQuery,
  useUpdateFooterContentMutation,
  useCreateFooterContentMutation,
} from "@/lib/redux/features/post/postsApiSlice"
import { Button } from "@/components/ui/button"
import Loader from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Upload, Save, Trash2, RefreshCw, ImageIcon } from "lucide-react"
import AdvancedCKEditor from "@/components/common/advanced-ckeditor"

const FooterPage = () => {
  const { data, isLoading, isError } = useGetFooterContentQuery()
  const [updateFooterContent, { isLoading: isUpdating }] = useUpdateFooterContentMutation()
  const [createFooterContent, { isLoading: isCreating }] = useCreateFooterContentMutation()
  const { toast } = useToast()

  const [editorData, setEditorData] = useState("")
  const [footerId, setFooterId] = useState<string | null>(null)
  const [serverImages, setServerImages] = useState<string[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [editorError, setEditorError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dataLoadedRef = useRef(false)
  const allImages = [...serverImages, ...newImagePreviews]
  const isProcessing = isLoading || isUpdating || isCreating


  useEffect(() => {
    if (data?.data?.[0] && !dataLoadedRef.current) {
      const footer = data.data[0]
      setFooterId(footer._id)
      setEditorData(footer.content || "")
      setServerImages(footer.images || [])
      dataLoadedRef.current = true
    }
  }, [data])

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url)
      })
    }
  }, [newImagePreviews])

  const handleEditorChange = (_: any, editor: any) => {
    const content = editor.getData()
    setEditorData(content)
    setEditorError(content.trim() === "" ? "Content is required." : "")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"))
    if (files.length === 0) return

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setUploadedFiles((prev) => [...prev, ...files])
    setNewImagePreviews((prev) => [...prev, ...newPreviews])

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveImage = (index: number) => {
    if (index < serverImages.length) {
      setServerImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      const newIndex = index - serverImages.length
      const imageToRemove = newImagePreviews[newIndex]

      setNewImagePreviews((prev) => prev.filter((_, i) => i !== newIndex))
      setUploadedFiles((prev) => {
        const newFiles = [...prev]
        newFiles.splice(newIndex, 1)
        return newFiles
      })

      URL.revokeObjectURL(imageToRemove)
    }
  }

  const handleSave = async () => {
    if (editorData.trim() === "") {
      setEditorError("Content is required.")
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Content is required.",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("content", editorData)

      serverImages.forEach((url) => formData.append("images", url))
      uploadedFiles.forEach((file) => formData.append("images", file))

      const result = await (footerId
        ? updateFooterContent({ id: footerId, formData }).unwrap()
        : createFooterContent({ formData }).unwrap())

      if (!result.success) {
        throw new Error(result.message || "Something went wrong")
      }

      setServerImages(result.data?.images || [])

      newImagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setNewImagePreviews([])
      setUploadedFiles([])
      setFooterId(result.data._id)

      toast({
        title: footerId ? "Updated Successfully" : "Created Successfully",
        description: result.message || "Saved content successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message,
      })
    }
  }

  return (
    <RootLayout>
      <div className="p-4 ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4 text-customButton-text">Footer Content Management</h1>
        </div>

        {isProcessing && <Loader />}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>Failed to load footer content. Please try refreshing the page.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="">
            {/* Content Editor */}


            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                Footer Content <span className="text-red-500">*</span>
              </label>
              <div className="min-h-[200px] overflow-y-auto border rounded scrollbar-custom">
                <AdvancedCKEditor
                  data={editorData}
                  onChange={handleEditorChange}
                  placeholder="Type or paste your footer content here!"
                />              </div>
              {editorError && <p className="mt-1 text-sm text-red-500">{editorError}</p>}
            </div>


            {/* Image Upload */}
            <h2 className=" text-gray-800 text-sm font-medium mt-8">Footer Images</h2>
            <div className="bg-white border rounded-md shadow-sm p-4 mt-2 ">
              <div className="flex justify-end items-center mb-4">
                <div className="flex gap-2">
                  {serverImages.length > 0 && (
                    <span className="px-2 py-0.5 bg-blue-50 rounded-full text-blue-700 text-xs border border-blue-100">
                      {serverImages.length} Saved
                    </span>
                  )}
                  {newImagePreviews.length > 0 && (
                    <span className="px-2 py-0.5 bg-green-50 rounded-full text-green-700 text-xs border border-green-100">
                      {newImagePreviews.length} New
                    </span>
                  )}
                </div>
              </div>

              {/* Upload Area */}
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border border-dashed rounded-md p-4 mb-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-100 rounded-full">
                    <Upload className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload images</p>
                    <p className="text-xs text-gray-500">All file formats supported, up to 5MB</p>
                  </div>
                  {/* <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="ml-auto">
                    Browse
                  </Button> */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Image Gallery */}
              {allImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {allImages.map((img, index) => {
                    const isServerImage = index < serverImages.length
                    return (
                      <div
                        key={index}
                        className="group relative rounded-md overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="h-40 w-60 relative">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Footer image ${index + 1}`}
                            className="w-full h-full"
                          />

                          {/* Delete button - now positioned at top right */}
                          <button
                            className="absolute top-1 right-1 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Status indicator */}
                          {isServerImage ? (
                            <div className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          ) : (
                            <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md bg-gray-50">
                  <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                  <p className="mt-1 text-sm text-gray-500">No images yet</p>
                </div>
              )}
            </div>

            {/* Save Button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSave}
                  disabled={isProcessing || editorData.trim() === ""}
                  className={`bg-gradient-to-r  
                                      from-customButton-gradientFrom
                                      to-customButton-gradientTo
                                      text-customButton-text
                                      hover:bg-customButton-hoverBg
                                      hover:text-customButton-hoverText
                                        transition-all duration-200 shadow-md hover:shadow-lg
                                        disabled:opacity-50 text-base font-medium
                                        ${isProcessing || !editorData ? "cursor-not-allowed" : ""}
                                      `}
                >
                  {isProcessing ? "Saving..." : "Save"}
                </Button>
              </div>
          </div>
        )}
      </div>
    </RootLayout>
  )
}

export default FooterPage
