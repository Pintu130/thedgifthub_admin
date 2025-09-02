"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import ReactPaginate from "react-paginate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useDeleteAuthUserMutation,
  useGetAuthUsersQuery,
  useGetRoleDropdownQuery,
} from "@/lib/redux/features/post/postsApiSlice"
import Loader from "@/components/loading-screen"
import { Pencil, Search, Trash2, UserPlus } from "lucide-react"
import Modal from "@/components/common/Modal"
import { useToast } from "@/hooks/use-toast"
import TableModalUserList from "@/app/users/TableModalUserList"

// Define the UserFormData interface to match the one in TableModalUserList
interface UserFormData {
  id?: string
  name: string
  email: string
  password: string
  role: string
}

// Define pagination params interface
interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  role?: string
}

const UsersData = () => {
  // State for search and filters
  const [searchText, setSearchText] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10, // Fixed page size of 5 as requested
  })

  // API queries
  const { data, isLoading, isFetching, isError, refetch } = useGetAuthUsersQuery(paginationParams)
  const [deleteAuthUser, { isLoading: isDeleting }] = useDeleteAuthUserMutation()
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoleDropdownQuery()

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "",
  })

  const { toast } = useToast()
  const isPaginationClickInProgress = useRef(false)
  const [isSearching, setIsSearching] = useState(false)

  // Check if search button should be disabled
  const isSearchDisabled = !searchText && !selectedRole

  // Handle search button click
  const handleSearch = () => {
    const newParams: PaginationParams = {
      ...paginationParams,
      page: 1, // Reset to first page on new search
      search: searchText || undefined,
      role: selectedRole || undefined,
    }
    setPaginationParams(newParams)
    setCurrentPage(0) // Reset pagination component
  }

  // Clear search filters
  const clearFilters = () => {
    setSearchText("")
    setSelectedRole("")
    setPaginationParams({
      page: 1,
      limit: 10,
    })
    setCurrentPage(0)
  }

  useEffect(() => {
    if (searchText === "" && selectedRole === "") {
      clearFilters();
    }
  }, [searchText, selectedRole]);

  // Toggle user form modal
  const toggleModal = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    })
    setIsModalVisible(!isModalVisible)
  }, [isModalVisible])

  // Handle edit user
  const handleEdit = useCallback((userData: any) => {
    setFormData({
      id: userData._id,
      name: userData.name,
      email: userData.email,
      password: "", // Don't populate password for security reasons
      role: userData.role,
    })
    setIsModalVisible(true)
  }, [])

  // Close delete confirmation modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUserId(null)
  }

  // Handle delete action
  const handleDelete = (userId: string) => {
    setSelectedUserId(userId)
    setIsModalOpen(true)
  }

  // Confirm deletion
  const confirmDelete = async () => {
    if (selectedUserId) {
      try {
        const res = await deleteAuthUser(selectedUserId).unwrap()

        toast({
          title: "Delete User",
          description: res?.message || "User deleted successfully",
        })

        refetch()
      } catch (error: any) {
        toast({
          title: "Delete User",
          description: error?.data?.message || "Failed to delete user",
        })
      } finally {
        setIsModalOpen(false)
        setSelectedUserId(null)
      }
    }
  }

  // Function to refresh the data
  const refreshGridData = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle page change
  const handlePageClick = (event: { selected: number }) => {
    // Prevent multiple rapid clicks
    if (isPaginationClickInProgress.current || isSearching) return

    isPaginationClickInProgress.current = true
    setIsSearching(true) // Set loading state

    const newPage = event.selected + 1 // API uses 1-based indexing
    setPaginationParams({
      ...paginationParams,
      page: newPage,
    })
    setCurrentPage(event.selected)

    // We'll clear the states after a short delay
    setTimeout(() => {
      setIsSearching(false)
      isPaginationClickInProgress.current = false
    }, 1000)
  }


  // Determine if we should show the loader
  const showLoader = isLoading || isFetching || isDeleting || isRolesLoading || isSearching

  return (
    <div className="space-y-4 text-[#333]">
      {/* Header */}
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Users</h1>
        <p className="text-sm text-[#7A6C53] mt-1">Manage your users and their permissions</p>
      </div>

      {/* Card Section */}
      <Card className="shadow-md border border-[#EADFC8]">
        {/* Card Header Row */}
        <div className="flex flex-wrap flex-col md:flex-row md:justify-between md:items-center px-7 pt-4 gap-4">
          {/* Left - Title */}
          <div>
            <CardHeader className="p-0">
              <CardTitle className="text-lg text-[#4B3F2F]">All Users</CardTitle>
            </CardHeader>
          </div>

          {/* Right - Role Filter + Search + Add User */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto lg:flex-nowrap">
            {/* Role Dropdown */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border outline-none p-2 rounded-md shadow-sm focus:outline-none w-full sm:w-40 lg:w-32 xl:w-40"
              aria-label="Filter by role"
              disabled={showLoader}
            >
              <option value="">All Roles</option>
              {rolesResponse?.data?.map((role: string) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            {/* Search Box */}
            <input
              type="text"
              placeholder="Search..."
              className="border outline-none p-2 rounded-md shadow-sm w-full sm:flex-1 md:w-48 xl:w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              aria-label="Search users"
              disabled={showLoader}
            />

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearchDisabled || showLoader}
              className={`px-4 py-2 rounded-md bg-gradient-to-r 
                      from-customButton-gradientFrom
                      to-customButton-gradientTo
                      text-customButton-text
                      hover:bg-customButton-hoverBg
                      hover:text-customButton-hoverText font-semibold transition w-full sm:w-auto flex items-center justify-center gap-2
                      ${isSearchDisabled || showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Apply search"
            >
              <Search size={16} />
              <span>Search</span>
            </button>

            {/* Clear Filters Button (only show when filters are applied) */}
            {(searchText || selectedRole) && (
              <button
                onClick={clearFilters}
                disabled={showLoader}
                className={`px-4 py-2 rounded-md bg-[#FEE2E2] text-[#B91C1C] 
                        hover:bg-[#FCA5A5] hover:text-[#7F1D1D] border border-[#FCA5A5] 
                          font-semibold transition w-full sm:w-auto flex items-center justify-center gap-2 
                          ${showLoader ? "opacity-50 cursor-not-allowed" : ""}`}

                aria-label="Clear filters"
              >
                <span>Clear</span>
              </button>
            )}

            {/* Add User Button */}
            <button
              onClick={toggleModal}
              disabled={showLoader}
              className={`w-full sm:w-auto px-4 py-2 rounded-md bg-gradient-to-r 
                      from-customButton-gradientFrom
                      to-customButton-gradientTo
                      text-customButton-text
                      hover:bg-customButton-hoverBg
                      hover:text-customButton-hoverText font-semibold transition flex items-center justify-center gap-2
                      ${showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Add new user"
            >
              <UserPlus size={16} />
              <span className="">Add User</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="pt-4 relative">
          {/* Loader - Show during any API loading state */}
          {showLoader && (
            <Loader />
          )}
          {isError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p>Failed to load users. Please try again later.</p>
            </div>
          )}
          {data && (
            <div className="w-full overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-x-auto border border-[#EADFC8] rounded-xl">
                  <table className="min-w-[1000px] w-full text-sm text-left table-fixed">
                    <thead className="bg-[#FFEDED] text-[#800000]">
                      <tr>
                        <th className="p-3 font-semibold text-center w-1/5">Name</th>
                        <th className="p-3 font-semibold text-center w-1/5">Email</th>
                        <th className="p-3 font-semibold text-center w-1/5">Role</th>
                        <th className="p-3 font-semibold text-center w-1/5">Status</th>
                        <th className="p-3 font-semibold text-center w-1/5">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data && data.data.length > 0 ? (
                        data.data.map((user: any) => (
                          <tr key={user._id} className="border-t border-[#EADFC8]">
                            <td className="p-3 text-center text-[#4B3F2F] w-1/5 break-words">{user.name}</td>
                            <td className="p-3 text-center text-[#4B3F2F] w-1/5 break-words">{user.email}</td>
                            <td className="p-3 text-center text-[#4B3F2F] w-1/5 break-words">
                              {user.role === "admin"
                                ? "Admin"
                                : user.role === "subAdmin"
                                  ? "SubAdmin"
                                  : user.role === "manager"
                                    ? "Manager"
                                    : user.role}
                            </td>
                            <td className="p-3 text-center text-[#4B3F2F] w-1/5 break-words">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {user.status === 1 ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-3 text-center w-1/5 break-words">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleEdit(user)}
                                  disabled={showLoader}
                                  className={`p-1 rounded-full bg-[#EBF5FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] transition ${showLoader ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  aria-label="Edit user"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  disabled={showLoader}
                                  className={`p-1 rounded-full bg-[#F8E6E6] text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#B91C1C] transition ${showLoader ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  aria-label="Delete user"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-10 text-center bg-white text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  {data.meta && data.meta.totalPages > 1 && (
                    <div className="flex justify-center">
                      <ReactPaginate
                        previousLabel={"←"}
                        nextLabel={"→"}
                        breakLabel={"..."}
                        pageCount={data.meta.totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination flex gap-2"}

                        // Wrapper <li>
                        pageClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}
                        previousClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}
                        nextClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}
                        breakClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}

                        // Actual <a> clickable area
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
          )}

        </CardContent>
      </Card>

      {/* User Form Modal */}
      <TableModalUserList
        isModalVisible={isModalVisible}
        onClose={toggleModal}
        title={formData.id ? "Edit User" : "Add User"}
        closeLabel="Cancel"
        saveLabel={formData.id ? "Update" : "Save"}
        formData={formData}
        setFormData={setFormData}
        getTotalUsers={refreshGridData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default UsersData
