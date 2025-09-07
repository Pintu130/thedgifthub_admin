"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/loading-screen";
import Modal from "@/components/common/Modal";

interface Category {
  id?: string;
  name: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  name: string;
  image: File | null;
  imagePreview: string;
}

const CategoriesData = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; imageUrl: string } | null>(null);
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    image: null,
    imagePreview: "",
  });

  // Format date to dd/MM/yyyy hh:mm a
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '-';
    }
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filter categories based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchText, categories]);

  // Filter categories based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchText, categories]);

  // Initialize component - fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 2MB' }));
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: previewUrl,
      }));
      
      // Clear any previous image errors
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  // Remove selected image
  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: "",
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      image: null,
      imagePreview: "",
    });
    setErrors({});
    setEditingId(null);
  };

  // Handle add new category
  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      image: null,
      imagePreview: category.imageUrl || "",
    });
    setEditingId(category.id || null);
    setIsModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (id: string, imageUrl: string) => {
    setCategoryToDelete({ id, imageUrl });
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsDeleting(true);
      const url = new URL(`/api/categories/${categoryToDelete.id}`, window.location.origin);
      url.searchParams.append('imageUrl', categoryToDelete.imageUrl);
      
      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete category');
      }

      await fetchCategories();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { name?: string; image?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      setIsSubmitting(true);
      
      let response;
      if (editingId) {
        // Update existing category
        const oldImageUrl = categories.find(c => c.id === editingId)?.imageUrl || '';
        if (oldImageUrl) {
          formDataToSend.append('oldImageUrl', oldImageUrl);
        }
        
        response = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        // Create new category
        response = await fetch('/api/categories', {
          method: 'POST',
          body: formDataToSend,
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      await fetchCategories();
      resetForm();
      setIsModalOpen(false);
      
      toast({
        title: 'Success',
        description: `Category ${editingId ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Column definitions for AG Grid
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      flex: 1,
      minWidth: 200,
      filter: false,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-3">
          {params.data.imageUrl && (
            <div className="flex-shrink-0">
              <Image
                src={params.data.imageUrl}
                alt={params.data.name}
                width={40}
                height={40}
                className="rounded-md object-cover"
              />
            </div>
          )}
          <span className="font-medium">{params.value || 'No name'}</span>
        </div>
      ),
    },
    {
      headerName: 'Last Updated',
      field: 'updatedAt',
      width: 180,
      valueFormatter: (params: any) => formatDate(params.value),
      filter: false,
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.data);
            }}
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (params.data.id) {
                handleDeleteClick(params.data.id, params.data.imageUrl);
              }
            }}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
      filter: false,
      width: 120,
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load categories. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[#333]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Categories</h1>
        <p className="text-sm text-[#7A6C53] mt-1">View, manage, and organize all categories</p>
      </div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {/* <CardTitle className="text-2xl font-bold">Categories</CardTitle> */}
          <CardHeader className="p-0">
                    <CardTitle className="text-lg text-gray-800">All Categories</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{categories.length} total categories</p>
                </CardHeader>
            {/* Search + Add Product */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      <button
                         onClick={() => {
                            setEditingId(null);
                            setFormData({
                              name: '',
                              image: null,
                              imagePreview: '',
                            });
                            setIsModalOpen(true);
                          }}
                        className="px-4 py-2 rounded-md bg-gradient-to-r 
                                                 from-customButton-gradientFrom
                                                 to-customButton-gradientTo
                                                 text-customButton-text
                                                 hover:bg-customButton-hoverBg
                                                 hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
                        aria-label="Add new product"
                      >
                        <Plus size={16} />
                        <span>Add Category</span>
                      </button>
                    </div>
        </CardHeader>
        <CardContent>
          <div className="ag-theme-alpine" style={{ height: '300px', width: '100%' }}>
            <AgGridReact
              rowData={filteredCategories}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              suppressCellFocus={true}
              onGridReady={onGridReady}
            />
          </div>
        </CardContent>
      </Card>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {formData.imagePreview ? (
                    <div className="mt-2">
                      <div className="relative">
                        <img 
                          src={formData.imagePreview} 
                          alt="Category preview" 
                          className="h-40 w-full object-cover rounded-md border border-gray-300" 
                        />
                        <button 
                          type="button" 
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <p className="pl-1">Click to upload an image</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (max. 2MB)</p>
                      </div>
                    </div>
                  )}
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    // className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    className="px-4 py-2 rounded-md bg-gradient-to-r 
                    from-customButton-gradientFrom
                    to-customButton-gradientTo
                    text-customButton-text
                    hover:bg-customButton-hoverBg
                    hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
                  >
                    {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Category
                </h3>
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isDeleting}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to delete this category? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setDeleteModalOpen(false)} 
                    disabled={isDeleting}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesData;
