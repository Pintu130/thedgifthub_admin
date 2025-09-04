"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Pencil, Plus, Trash2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import TableModalProductData from "@/app/products/TableModalProductData"

export interface Product {
  id?: string
  name: string
  amount: string
  discount: string
  availableOffers: string
  highlights: string
  images: string[]
  createdAt?: any
  updatedAt?: any
}

interface ProductFormData {
  id?: string
  name: string
  amount: string
  discount: string
  availableOffers: string
  highlights: string
  images?: File[]
  imagesPreviews?: string[]
}

const ProductData = () => {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    amount: "",
    discount: "",
    availableOffers: "",
    highlights: "",
    images: [],
    imagesPreviews: [],
  })

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      setProducts(data.products)
      setFilteredProducts(data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
      setIsError(true)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Filter products based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.amount.toLowerCase().includes(searchText.toLowerCase()) ||
          product.discount.toLowerCase().includes(searchText.toLowerCase()),
      )
      setFilteredProducts(filtered)
    }
    setCurrentPage(1) // Reset to first page when searching
  }, [searchText, products])

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const toggleModal = useCallback(() => {
    setFormData({
      name: "",
      amount: "",
      discount: "",
      availableOffers: "",
      highlights: "",
      images: [],
      imagesPreviews: [],
    })
    setIsModalVisible(!isModalVisible)
  }, [isModalVisible])

  const handleEdit = useCallback((product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      amount: product.amount,
      discount: product.discount,
      availableOffers: product.availableOffers,
      highlights: product.highlights,
      images: [],
      imagesPreviews: product.images, // Set existing image URLs for preview
    })
    setIsModalVisible(true)
  }, [])

  // Open delete confirmation modal
  const handleDelete = useCallback((product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }, [])

  // Close delete confirmation modal
  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setProductToDelete(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      fetchProducts() // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product",
      })
    } finally {
      setIsDeleting(false)
      closeDeleteModal()
    }
  }, [productToDelete, toast, fetchProducts, closeDeleteModal])

  const refreshGridData = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const stripHtml = (html: string) => {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
        <p className="text-sm text-gray-600 mt-1">View, manage, and organize all products and their details here</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Products</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{filteredProducts.length || 0} total products</p>
          </CardHeader>

          {/* Search + Add Product */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="border outline-none pl-10 pr-4 py-2 rounded-md shadow-sm w-52 lg:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchText}
                onChange={onSearchTextChange}
                aria-label="Search products"
              />
            </div>
            <button
              onClick={toggleModal}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold transition flex items-center gap-2"
              aria-label="Add new product"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        <CardContent className="pt-4">
          {isLoading && <Loader />}
          {isError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p>Failed to load products. Please try again later.</p>
            </div>
          )}
          {!isLoading && !isError && (
            <div className="space-y-4">
              {/* Custom Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount ($)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount (%)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Highlights
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product, index) => (
                        <tr key={product.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <img
                              src={product.images?.[0] || "/placeholder.svg?height=40&width=40"}
                              alt={product.name}
                              className="w-10 h-10 rounded-sm object-cover"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${product.amount}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.discount}%</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-700 max-w-xs truncate">
                              {stripHtml(product.highlights)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                                aria-label="Edit product"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
                                aria-label="Delete product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {searchText ? "No products found matching your search." : "No products available."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of{" "}
                    {filteredProducts.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <TableModalProductData
        isModalVisible={isModalVisible}
        onClose={toggleModal}
        title={formData.id ? "Edit Product" : "Add Product"}
        closeLabel="Cancel"
        saveLabel={formData.id ? "Update" : "Save"}
        formData={formData}
        setFormData={setFormData}
        getTotalProducts={refreshGridData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default ProductData
