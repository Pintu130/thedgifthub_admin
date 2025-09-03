"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductFormData } from "@/lib/types/product";
import { createProduct, updateProduct } from "@/lib/services/productService";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import AdvancedCKEditor from "@/components/common/advanced-ckeditor";

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productPrice: z.number().min(0, "Price must be positive"),
  originalPrice: z.number().min(0, "Original price must be positive"),
  discountPercentage: z.number().min(0).max(100, "Discount must be between 0-100%"),
  availableOffers: z.string().min(1, "Available offers is required"),
  highlights: z.string().min(1, "Highlights is required"),
});

type ProductFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ProductFormData | null;
};

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [availableOffers, setAvailableOffers] = useState("");
  const [highlights, setHighlights] = useState("");
  const [availableOffersError, setAvailableOffersError] = useState("");
  const [highlightsError, setHighlightsError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      productPrice: 0,
      originalPrice: 0,
      discountPercentage: 0,
      activity: 1,
    },
  });

  const watchedPrice = watch("productPrice");
  const watchedOriginalPrice = watch("originalPrice");

  // Calculate discount percentage automatically
  useEffect(() => {
    if (watchedOriginalPrice > 0 && watchedPrice > 0) {
      const discount = ((watchedOriginalPrice - watchedPrice) / watchedOriginalPrice) * 100;
      setValue("discountPercentage", Math.round(discount * 100) / 100);
    }
  }, [watchedPrice, watchedOriginalPrice, setValue]);

  // Load edit data
  useEffect(() => {
    if (editData) {
      setValue("productName", editData.productName);
      setValue("productPrice", editData.productPrice);
      setValue("originalPrice", editData.originalPrice);
      setValue("discountPercentage", editData.discountPercentage);
      setValue("activity", editData.activity);
      setAvailableOffers(editData.availableOffers);
      setHighlights(editData.highlights);
      setExistingImages(editData.imageUrls || []);
    }
  }, [editData, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedImages([]);
      setExistingImages([]);
      setAvailableOffers("");
      setHighlights("");
    }
  }, [isOpen, reset]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
    }
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Available Offers editor change
  const handleAvailableOffersChange = (_: any, editor: any) => {
    const content = editor.getData();
    setAvailableOffers(content);
    
    if (content.trim() === "") {
      setAvailableOffersError("Available offers is required");
    } else {
      setAvailableOffersError("");
    }
  };

  // Handle Highlights editor change
  const handleHighlightsChange = (_: any, editor: any) => {
    const content = editor.getData();
    setHighlights(content);
    
    if (content.trim() === "") {
      setHighlightsError("Highlights is required");
    } else {
      setHighlightsError("");
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Selected images:", selectedImages);
    console.log("Available offers:", availableOffers);
    console.log("Highlights:", highlights);

    if (selectedImages.length === 0 && existingImages.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one image is required",
      });
      return;
    }

    // Check if CKEditor content is empty (strip HTML tags)
    const strippedOffers = availableOffers.replace(/<[^>]*>/g, '').trim();
    const strippedHighlights = highlights.replace(/<[^>]*>/g, '').trim();

    if (!strippedOffers) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Available offers is required",
      });
      return;
    }

    if (!strippedHighlights) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Highlights is required",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData: ProductFormData = {
        ...data,
        images: selectedImages,
        imageUrls: existingImages,
        availableOffers,
        highlights,
      };

      console.log("Submitting form data:", formData);

      if (editData?.id) {
        console.log("Updating product with ID:", editData.id);
        await updateProduct(editData.id, formData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        console.log("Creating new product...");
        const productId = await createProduct(formData);
        console.log("Product created with ID:", productId);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save product",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {editData ? "Edit Product" : "Add New Product"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                <X size={20} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Product Name */}
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  {...register("productName")}
                  placeholder="Enter product name"
                  disabled={isLoading}
                />
                {errors.productName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.productName.message}
                  </p>
                )}
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price *</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    {...register("originalPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    disabled={isLoading}
                  />
                  {errors.originalPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.originalPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="productPrice">Sale Price *</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    {...register("productPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    disabled={isLoading}
                  />
                  {errors.productPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.productPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="discountPercentage">Discount %</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    step="0.01"
                    {...register("discountPercentage", { valueAsNumber: true })}
                    placeholder="0"
                    disabled={isLoading}
                    readOnly
                  />
                  {errors.discountPercentage && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.discountPercentage.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Product Images *</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload images
                      </p>
                    </div>
                  </label>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Existing Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            disabled={isLoading}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Images */}
                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">New Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            disabled={isLoading}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Available Offers */}
              <div>
                <Label>Available Offers *</Label>
                <div className="mt-2 max-h-[350px] overflow-y-auto border rounded scrollbar-custom">
                  <AdvancedCKEditor
                    data={availableOffers}
                    onChange={handleAvailableOffersChange}
                    placeholder="Enter available offers and promotions..."
                    disabled={isLoading}
                  />
                </div>
                {availableOffersError && (
                  <p className="mt-1 text-sm text-red-500">{availableOffersError}</p>
                )}
              </div>

              {/* Highlights */}
              <div>
                <Label>Highlights *</Label>
                <div className="mt-2 max-h-[350px] overflow-y-auto border rounded scrollbar-custom">
                  <AdvancedCKEditor
                    data={highlights}
                    onChange={handleHighlightsChange}
                    placeholder="Enter product highlights and key features..."
                    disabled={isLoading}
                  />
                </div>
                {highlightsError && (
                  <p className="mt-1 text-sm text-red-500">{highlightsError}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : editData
                    ? "Update Product"
                    : "Create Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductForm;
