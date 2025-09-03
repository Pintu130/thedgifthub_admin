"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loading-screen";
import { Pencil, Search, Trash2, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Modal from "@/components/common/Modal";
import ProductForm from "./ProductForm";
import { Product, ProductFormData, PaginationParams } from "@/lib/types/product";
import {
  getProducts,
  deleteProduct,
  toggleProductActivity,
} from "@/lib/services/productService";

const ProductsDataTable = () => {
  const { toast } = useToast();

  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 20,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  // Loading state for individual status updates
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set());

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editData, setEditData] = useState<ProductFormData | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPaginationClickInProgress = useRef(false);
  const [isSearching, setIsSearching] = useState(false);
  const isSearchDisabled = !searchText;
  const showLoader = isLoading || isFetching || isDeleting || isSearching;

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsFetching(true);
    setIsError(false);
    try {
      const response = await getProducts(paginationParams);
      setProducts(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsError(true);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again.",
      });
    } finally {
      setIsFetching(false);
    }
  }, [paginationParams, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle status toggle
  const handleStatusToggle = useCallback(
    async (product: Product) => {
      const newActivity = product.activity === 1 ? 0 : 1;
      const productId = product.id!;

      setUpdatingStatusIds((prev) => new Set(prev).add(productId));

      try {
        await toggleProductActivity(productId, newActivity);

        toast({
          title: "Success",
          description: `Product ${newActivity === 1 ? "activated" : "deactivated"} successfully`,
        });

        fetchProducts();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update status",
        });
      } finally {
        setUpdatingStatusIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [toast, fetchProducts]
  );

  const handleSearch = () => {
    const newParams: PaginationParams = {
      ...paginationParams,
      page: 1,
      search: searchText || undefined,
    };
    setPaginationParams(newParams);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSearchText("");
    setPaginationParams({ page: 1, limit: 20 });
    setCurrentPage(0);
  };

  useEffect(() => {
    if (!searchText) {
      clearFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleEdit = useCallback((product: Product) => {
    const formData: ProductFormData = {
      id: product.id,
      productName: product.productName,
      productPrice: product.productPrice,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      images: [],
      imageUrls: product.images || [],
      availableOffers: product.availableOffers,
      highlights: product.highlights,
      activity: product.activity,
    };
    setEditData(formData);
    setIsFormVisible(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete product",
      });
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  }, [productToDelete, toast, fetchProducts, closeDeleteModal]);

  const handlePageClick = (event: { selected: number }) => {
    if (isPaginationClickInProgress.current || isSearching) return;
    isPaginationClickInProgress.current = true;
    setIsSearching(true);
    const newPage = event.selected + 1;
    setPaginationParams({ ...paginationParams, page: newPage });
    setCurrentPage(event.selected);
    setTimeout(() => {
      setIsSearching(false);
      isPaginationClickInProgress.current = false;
    }, 1000);
  };

  const handleAddProduct = () => {
    setEditData(null);
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setEditData(null);
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    const strippedText = text.replace(/<[^>]*>/g, "");
    return strippedText.length > maxLength
      ? strippedText.substring(0, maxLength) + "..."
      : strippedText;
  };

  return (
    <div className="text-[#333]">
      {/* Header */}
      <div className="px-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">
          Products Management
        </h1>
        <p className="text-sm text-[#7A6C53] mt-1">Manage your products</p>
      </div>

      {/* Card Section */}
      <Card className="shadow-lg border border-[#EADFC8]">
        <div className="flex flex-wrap flex-col md:flex-row md:justify-between md:items-center px-7 pt-4 gap-4">
          <div>
            <CardHeader className="p-0">
              <CardTitle className="text-lg text-[#4B3F2F]">
                All Products
              </CardTitle>
              <p className="text-sm text-[#7A6C53] mt-1">
                {meta.total || 0} total products
              </p>
            </CardHeader>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto lg:flex-nowrap">
            {/* Add Product Button */}
            <Button
              onClick={handleAddProduct}
              disabled={showLoader}
              className="bg-gradient-to-r from-customButton-gradientFrom to-customButton-gradientTo text-customButton-text hover:bg-customButton-hoverBg hover:text-customButton-hoverText font-semibold transition w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Button>
            <Input
              type="text"
              placeholder="Search products..."
              className="border outline-none p-2 rounded-md shadow-sm w-full sm:flex-1 md:w-48 xl:w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={showLoader}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearchDisabled || showLoader}
              className={`px-4 py-2 rounded-md bg-gradient-to-r 
                from-customButton-gradientFrom
                to-customButton-gradientTo
                text-customButton-text
                hover:bg-customButton-hoverBg
                hover:text-customButton-hoverText font-semibold transition w-full sm:w-auto flex items-center justify-center gap-2
                ${isSearchDisabled || showLoader
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
            >
              <Search size={16} />
              <span>Search</span>
            </Button>
            {searchText && (
              <Button
                onClick={clearFilters}
                disabled={showLoader}
                className={`px-4 py-2 rounded-md bg-[#FEE2E2] text-[#B91C1C] 
                  hover:bg-[#FCA5A5] hover:text-[#7F1D1D] border border-[#FCA5A5] 
                  font-semibold transition w-full sm:w-auto flex items-center justify-center gap-2 
                  ${showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>Clear</span>
              </Button>
            )}
          </div>
        </div>

        <CardContent className="pt-6 relative">
          {showLoader && <Loader />}
          {isError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p>Failed to load products. Please try again later.</p>
            </div>
          )}

          {products.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-x-auto border border-[#EADFC8] rounded-xl">
                  <table className="min-w-[1400px] w-full text-sm text-left table-fixed">
                    <thead className="bg-[#FFEDED] text-[#800000]">
                      <tr>
                        <th className="p-3 font-semibold text-center w-[100px]">
                          Image
                        </th>
                        <th className="p-3 font-semibold text-center w-[200px]">
                          Product Name
                        </th>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Price
                        </th>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Original Price
                        </th>
                        <th className="p-3 font-semibold text-center w-[100px]">
                          Discount
                        </th>
                        <th className="p-3 font-semibold text-center w-[200px]">
                          Offers
                        </th>
                        <th className="p-3 font-semibold text-center w-[200px]">
                          Highlights
                        </th>
                        <th className="p-3 font-semibold text-center w-[100px]">
                          Status
                        </th>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Created Date
                        </th>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="border-t border-[#EADFC8] hover:bg-gray-50"
                        >
                          <td className="p-3 text-center w-[100px]">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.productName}
                                className="w-16 h-16 object-cover rounded-lg mx-auto"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                                <Eye size={20} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[200px] break-words">
                            <div className="font-semibold">
                              {product.productName}
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[120px]">
                            <div className="font-semibold text-green-600">
                              {formatPrice(product.productPrice)}
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[120px]">
                            <div className="text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[100px]">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              {product.discountPercentage}% OFF
                            </span>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[200px] break-words">
                            <div className="text-xs">
                              {truncateText(product.availableOffers)}
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[200px] break-words">
                            <div className="text-xs">
                              {truncateText(product.highlights)}
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[100px]">
                            <div className="flex items-center justify-center h-full">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={product.activity === 1}
                                  disabled={updatingStatusIds.has(product.id!)}
                                  onChange={() => handleStatusToggle(product)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-[#FFC0C0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#C70000] peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFC0C0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#FFB3B3] peer-checked:to-[#C70000] peer-disabled:opacity-50"></div>
                              </label>
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[120px]">
                            <div className="text-xs">
                              {new Date(product.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td className="p-3 text-center w-[120px]">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(product)}
                                disabled={showLoader}
                                className="p-1 rounded-full bg-[#EBF5FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] transition"
                                title="Edit Product"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(product.id!)}
                                disabled={showLoader}
                                className="p-1 rounded-full bg-[#F8E6E6] text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#B91C1C] transition"
                                title="Delete Product"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  {meta.totalPages > 1 && (
                    <div className="flex justify-center">
                      <ReactPaginate
                        previousLabel={"←"}
                        nextLabel={"→"}
                        breakLabel={"..."}
                        pageCount={meta.totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination flex gap-2"}
                        pageClassName={
                          "border border-[#EADFC8] bg-white rounded cursor-pointer"
                        }
                        previousClassName={
                          "border border-[#EADFC8] bg-white rounded cursor-pointer"
                        }
                        nextClassName={
                          "border border-[#EADFC8] bg-white rounded cursor-pointer"
                        }
                        breakClassName={
                          "border border-[#EADFC8] bg-white rounded cursor-pointer"
                        }
                        pageLinkClassName={"block px-3 py-1 w-full h-full"}
                        previousLinkClassName={"block px-3 py-1 w-full h-full"}
                        nextLinkClassName={"block px-3 py-1 w-full h-full"}
                        breakLinkClassName={"block px-3 py-1 w-full h-full"}
                        activeClassName={
                          "bg-gradient-to-r from-customButton-gradientFrom to-customButton-gradientTo text-customButton-text"
                        }
                        disabledClassName={"opacity-50 cursor-not-allowed"}
                        forcePage={currentPage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-500 text-center">
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-sm">
                    There are no products to display at the moment.
                  </p>
                  <Button
                    onClick={handleAddProduct}
                    className="mt-4 bg-gradient-to-r from-customButton-gradientFrom to-customButton-gradientTo text-customButton-text"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isFormVisible}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editData={editData}
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
  );
};

export default ProductsDataTable;
