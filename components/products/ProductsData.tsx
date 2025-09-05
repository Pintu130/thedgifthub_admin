"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Pencil, Plus, Trash2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import TableModalProductData from "@/app/products/TableModalProductData"

import type { Product } from "@/lib/types/product"

export interface ProductFormData {
  id?: string
  name: string
  amount: string
  discount: string
  availableOffers: string
  highlights: string
  images: Array<File | string>
  imagesPreviews: string[]
  productPrice: number
  originalPrice: number
  discountPercentage: number
  activity: number
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
    productPrice: 0,
    originalPrice: 0,
    discountPercentage: 0,
    activity: 1
  })

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await fetch(
        `/api/products?page=${currentPage}&limit=${itemsPerPage}${searchText ? `&search=${encodeURIComponent(searchText)}` : ''}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const { data, pagination } = await response.json()
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setIsError(true)
      setProducts([])
      setFilteredProducts([])
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, searchText, toast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Filter products based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredProducts(products)
    } else {
      const searchLower = searchText.toLowerCase()
      const filtered = products.filter(
        (product) =>
          (product.productName?.toLowerCase() || '').includes(searchLower) ||
          (product.productPrice?.toString() || '').includes(searchText) ||
          (product.originalPrice?.toString() || '').includes(searchText) ||
          (product.discountPercentage?.toString() || '').includes(searchText) ||
          (product.availableOffers?.toLowerCase() || '').includes(searchLower) ||
          (product.highlights?.toLowerCase() || '').includes(searchLower)
      )
      setFilteredProducts(filtered)
    }
    // Reset to first page when search changes
    setCurrentPage(1)
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
      productPrice: 0,
      originalPrice: 0,
      discountPercentage: 0,
      activity: 1
    })
    setIsModalVisible(!isModalVisible)
  }, [isModalVisible])

  // Handle edit product
  const handleEdit = useCallback((product: Product) => {
    setFormData({
      id: product.id,
      name: product.productName || '',
      amount: product.productPrice?.toString() || '0',
      discount: product.discountPercentage?.toString() || '0',
      availableOffers: product.availableOffers || '',
      highlights: product.highlights || '',
      images: product.images || [],
      imagesPreviews: Array.isArray(product.images) ? product.images : [],
      productPrice: product.productPrice || 0,
      originalPrice: product.originalPrice || 0,
      discountPercentage: product.discountPercentage || 0,
      activity: product.activity || 1,
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

  // Handle delete product
  const confirmDelete = async () => {
    if (!productToDelete?.id) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      
      fetchProducts()
      closeDeleteModal()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const refreshGridData = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const stripHtml = (html: string | undefined): string => {
    if (!html) return ''
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  // Format price with 2 decimal places
  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return '0.00'
    return price.toFixed(2)
  }

  return (
    <div className="space-y-4 text-[#333] p-4">
      <div className="mb-6">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price ($)
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Highlights
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product, index) => (
                        <tr key={product.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={Array.isArray(product.images) && product.images.length > 0 
                                ? product.images[0] 
                                : "/placeholder.svg?height=40&width=40"}
                              alt={product.productName || 'Product Image'}
                              className="w-12 h-12 rounded-md object-cover border border-gray-200"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=40&width=40"
                              }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName || 'No Name'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {product.id || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              ${formatPrice(product.productPrice)}
                            </div>
                            {product.originalPrice && product.originalPrice > product.productPrice && (
                              <div className="text-xs text-gray-500 line-through">
                                ${formatPrice(product.originalPrice)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              product.discountPercentage && product.discountPercentage > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.discountPercentage || 0}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs line-clamp-2">
                              {product.highlights ? stripHtml(product.highlights) : 'No highlights'}
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
