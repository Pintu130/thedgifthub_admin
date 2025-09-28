"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import TableModalUserList from "@/app/customers/TableModalUserList"
import type { ColDef } from "ag-grid-community"
import { collection, getDocs, doc, query, where, Query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { deleteUser } from "@/lib/services/customerService"
import ViewUserModal from "../common/ViewUserModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface UserFormData {
  id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  // Removed old address fields
  // address: string
  // city: string
  gender: string
  dob?: string
  orderCount?: number
  lastOrderDate?: string
  wishlistCount?: number
  supportRequestCount?: number
  activityStatus?: string
  notes?: string
  // New address fields
  image?: (string | File)[]
  addressType?: string
  pincode?: string
  state?: string
  houseNo?: string
  roadName?: string
  landmark?: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  // Removed old address fields
  // address: string
  // city: string
  gender: string
  dob?: string
  orderCount?: number
  lastOrderDate?: string
  wishlistCount?: number
  supportRequestCount?: number
  activityStatus?: string
  notes?: string
  // New address fields
  image?: string[]
  addressType?: string
  pincode?: string
  state?: string
  houseNo?: string
  roadName?: string
  landmark?: string
  createdAt?: any
  updatedAt?: any
}

const UsersData = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // Add/Edit modal
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    // Removed old address fields
    // address: "",
    // city: "",
    gender: "",
    dob: "",
    orderCount: 0,
    lastOrderDate: "",
    wishlistCount: 0,
    supportRequestCount: 0,
    activityStatus: "active",
    notes: "",
    // New address fields
    image: [],
    addressType: "",
    pincode: "",
    state: "",
    houseNo: "",
    roadName: "",
    landmark: "",
  })

  // View modal
  const [viewUser, setViewUser] = useState<User | null>(null)

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Grid
  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(10)
  const [gridApi, setGridApi] = useState<any>(null)

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      let usersQuery: Query = collection(db, "users")
      if (statusFilter !== "all") {
        usersQuery = query(usersQuery, where("activityStatus", "==", statusFilter))
      }
      const snapshot = await getDocs(usersQuery)
      const data = snapshot.docs.map((d) => {
        const raw = d.data() as any
        return {
          id: d.id,
          firstName: raw.firstName || "",
          lastName: raw.lastName || "",
          email: raw.email || "",
          phoneNumber: raw.phoneNumber || "",
          // Removed old address fields
          // address: raw.address || "",
          // city: raw.city || "",
          gender: raw.gender || "",
          dob: raw.dob || "",
          // New address fields
          image: raw.image || [],
          addressType: raw.addressType || "",
          pincode: raw.pincode || "",
          state: raw.state || "",
          houseNo: raw.houseNo || "",
          roadName: raw.roadName || "",
          landmark: raw.landmark || "",
          orderCount: raw.orderCount ?? 0,
          lastOrderDate: raw.lastOrderDate ?? "",
          wishlistCount: raw.wishlistCount ?? 0,
          supportRequestCount: raw.supportRequestCount ?? 0,
          activityStatus: raw.activityStatus || "inactive",
          notes: raw.notes || "",
          createdAt: raw.createdAt ?? null,
          updatedAt: raw.updatedAt ?? null,
        } as User
      })
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      setIsError(true)
      setUsers([])
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }

  const toggleModal = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      // Removed old address fields
      // address: "",
      // city: "",
      gender: "",
      dob: "",
      orderCount: 0,
      lastOrderDate: "",
      wishlistCount: 0,
      supportRequestCount: 0,
      activityStatus: "active",
      notes: "",
      // New address fields
      image: [],
      addressType: "",
      pincode: "",
      state: "",
      houseNo: "",
      roadName: "",
      landmark: "",
    })
    setIsModalVisible(!isModalVisible)
  }, [isModalVisible])

  const handleEdit = (user: User) => {
    setFormData(user)
    setIsModalVisible(true)
  }

  const handleView = (user: User) => {
    setViewUser(user)
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete?.id) return
    setIsDeleting(true)
    try {
      // Use the customer service to delete the user with proper image cleanup
      await deleteUser(userToDelete.id)
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
      fetchUsers()
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete customer. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const refreshGridData = useCallback(() => {
    fetchUsers()
  }, [fetchUsers])

  const columnDefs: ColDef[] = [
    { headerName: "First Name", field: "firstName", flex: 1, minWidth: 140 },
    { headerName: "Last Name", field: "lastName", flex: 1, minWidth: 140 },
    { headerName: "Email", field: "email", flex: 1.8, minWidth: 220 },
    { headerName: "Phone", field: "phoneNumber", flex: 1, minWidth: 120 },
    { headerName: "Orders", field: "orderCount", flex: 0.7, minWidth: 90 },
    {
      headerName: "Status",
      field: "activityStatus",
      width: 120,
      cellRenderer: (params: any) => (
       <span
          className={`px-2 py-1 text-xs rounded-full ${params.value === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {params.value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      headerName: "Actions",
      field: "action",
      flex: 1,
      minWidth: 180,
      cellRenderer: (params: any) => (
        <div className="h-full flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(params.data)}
            className="p-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(params.data)}
            className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(params.data)}
            className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }
  ]

  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Customers</h1>
        <p className="text-sm text-[#7A6C53] mt-1">View, manage, and organize all customers</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Customers</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{users.length} total customers</p>
          </CardHeader>

          <div className="flex gap-2 items-center">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="text"
              placeholder="Search customers..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              onChange={(e) => gridApi?.setQuickFilter(e.target.value)}
            />
          </div>
        </div>

        <CardContent className="pt-4">
          {isLoading && <Loader />}
          {isError && <p className="p-4 bg-red-50 text-red-700 rounded-md">Failed to load users.</p>}
          {!isLoading && !isError && (
            <div className="ag-theme-alpine w-full">
              <AgGridReact
                ref={gridRef}
                rowData={users}
                columnDefs={columnDefs}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  cellClass: "text-center text-[#2D3748] bg-white",
                }}
                pagination={true}
                paginationPageSize={paginationPageSize}
                domLayout="autoHeight"
                suppressCellSelection={true}
                onGridReady={onGridReady}
                rowHeight={52}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <TableModalUserList
        isModalVisible={isModalVisible}
        onClose={toggleModal}
        title={formData.id ? "Edit Customer" : "Add Customer"}
        closeLabel="Cancel"
        saveLabel={formData.id ? "Update" : "Save"}
        formData={formData}
        setFormData={setFormData}
        getTotalUsers={refreshGridData}
      />

      {/* View Modal */}
      <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} />

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default UsersData