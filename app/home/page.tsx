"use client"
import { useEffect, useState } from "react"
import RootLayout from "../RootLayout"
import { useGetHomeContentQuery, useUpdateHomeContentMutation } from "@/lib/redux/features/post/postsApiSlice"
import { Button } from "@/components/ui/button"
import Loader from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import FormInput from "@/components/common/FormInput"
import AdvancedCKEditor from "@/components/common/advanced-ckeditor"

const HomePage = () => {
    const { data, isLoading, isError } = useGetHomeContentQuery()
    const [updateHomeContent, { isLoading: isSaving }] = useUpdateHomeContentMutation()
    const { toast } = useToast()

    const [editorData, setEditorData] = useState("")
    const [title, setTitle] = useState("")
    const [subTitle, setSubTitle] = useState("")
    const [welcomeId, setWelcomeId] = useState<string | null>(null)
    const [editorError, setEditorError] = useState("")


    useEffect(() => {
        if (data?.data?.[0]) {
            const homeData = data.data[0]
            setWelcomeId(homeData._id)
            setEditorData(homeData.description || "")
            setTitle(homeData.title || "")
            setSubTitle(homeData.subTitle || "")
        }
    }, [data])

    const handleEditorChange = (_: any, editor: any) => {
        const content = editor.getData()
        setEditorData(content)

        if (content.trim() === "") {
            setEditorError("Description is required.")
        } else {
            setEditorError("")
        }
    }

    const handleSave = async () => {
        if (!welcomeId) return
        if (
            title.trim() === "" ||
            subTitle.trim() === "" ||
            editorData.trim() === ""
        ) {
            toast({
                variant: "destructive",
                title: "Validation error",
                description: "All fields are required.",
            })
            return
        }

        try {
            const res = await updateHomeContent({
                id: welcomeId,
                title,
                subTitle,
                description: editorData,
            }).unwrap()

            toast({
                title: "Home content updated",
                description: res?.message || "Home content updated successfully.",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update failed",
                description: error?.data?.message || "Something went wrong.",
            })
        }
    }

    const isFormValid =
        title.trim() !== "" &&
        subTitle.trim() !== "" &&
        editorData.trim() !== "" &&
        !editorError

    return (
        <RootLayout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4 text-customButton-text">Home Page Content</h1>

                {(isLoading || isSaving) && <Loader />}
                {isError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
                        Error loading home content. Please try again.
                    </div>
                )}

                {!isLoading && !isError && (
                    <>
                        <FormInput
                            label="Title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter home page title"
                            required
                            error={title.trim() === "" ? "Title is required" : ""}
                        />
                        <div className="mt-4">
                            <FormInput
                                label="Subtitle"
                                name="subtitle"
                                value={subTitle}
                                onChange={(e) => setSubTitle(e.target.value)}
                                placeholder="Enter home page subtitle"
                                required
                                error={subTitle.trim() === "" ? "Subtitle is required" : ""}
                            />
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <div className="max-h-[350px] overflow-y-auto border rounded scrollbar-custom">
                                <AdvancedCKEditor
                                    data={editorData}
                                    onChange={handleEditorChange}
                                    placeholder="Type or paste your home content here!"
                                />
                            </div>
                            {editorError && <p className="mt-1 text-sm text-red-500">{editorError}</p>}
                        </div>

                            <div className="flex justify-end mt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !isFormValid}
                                    className={`bg-gradient-to-r  
                                    from-customButton-gradientFrom
                                    to-customButton-gradientTo
                                    text-customButton-text
                                    hover:bg-customButton-hoverBg
                                    hover:text-customButton-hoverText
                                    transition-all duration-200 shadow-md hover:shadow-lg
                                    disabled:opacity-50 text-base font-medium
                                    ${isSaving || !isFormValid ? "cursor-not-allowed" : ""}
                                `}
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                            </div>

                        <h2 className="font-semibold text-2xl text-customButton-text mt-6">Preview:</h2>
                        <div className="mt-4 p-4 border rounded bg-white shadow max-h-[350px] overflow-y-auto scrollbar-custom">
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: editorData }} />
                        </div>
                    </>
                )}
            </div>
        </RootLayout>
    )
}

export default HomePage
