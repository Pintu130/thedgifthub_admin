"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import TableModalUserList from "@/app/customers/TableModalUserList"
import type { ColDef } from "ag-grid-community"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserFormData {
  id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: string
  city: string
  gender: string
}

interface User extends UserFormData {
  id: string
  createdAt?: any
  updatedAt?: any
}

const UsersData = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // Modals
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    gender: "",
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // AG Grid
  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(10)
  const [gridApi, setGridApi] = useState<any>(null)

  // ✅ Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const snapshot = await getDocs(collection(db, "users"))
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as User),
      )
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
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }

  // ✅ Toggle Add/Edit Modal
  const toggleModal = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      gender: "",
    })
    setIsModalVisible(!isModalVisible)
  }, [isModalVisible])

  // ✅ Edit
  const handleEdit = useCallback((user: User) => {
    setFormData({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      city: user.city,
      gender: user.gender,
    })
    setIsModalVisible(true)
  }, [])

  // ✅ Delete
  const handleDelete = useCallback((user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }, [])

  const confirmDelete = async () => {
    if (!userToDelete?.id) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "users", userToDelete.id))
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
      fetchUsers()
      closeDeleteModal()
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

  // ✅ Column Definitions
  const columnDefs: ColDef[] = [
    { headerName: "First Name", field: "firstName", flex: 1, sortable: true, filter: true, minWidth: 120, maxWidth: 200 },
    { headerName: "Last Name", field: "lastName", flex: 1, sortable: true, filter: true, minWidth: 120, maxWidth: 200 },
    { headerName: "Email", field: "email", flex: 1.5, sortable: true, filter: true, minWidth: 220, maxWidth: 300 },
    { headerName: "Phone", field: "phoneNumber", flex: 1, sortable: true, filter: true, minWidth: 150, maxWidth: 200 },
    { headerName: "Address", field: "address", flex: 2, sortable: true, filter: true, minWidth: 250, maxWidth: 400 },
    { headerName: "City", field: "city", flex: 1, sortable: true, filter: true, minWidth: 150, maxWidth: 200 },
    {
      headerName: "Gender",
      field: "gender",
      flex: 1,
      sortable: true,
      filter: true,
      minWidth: 120,
      maxWidth: 150,
      cellRenderer: (p: any) => <span className="capitalize">{p.value}</span>
    },
    {
      headerName: "Actions",
      field: "action",
      flex: 1,
      minWidth: 150,
      maxWidth: 180,
      cellRenderer: (params: any) => (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(params.data)}
              className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(params.data)}
              className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
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

          {/* Search + Add User */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search customers..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              onChange={(e) => gridApi?.setQuickFilter(e.target.value)}
            />
            {/* <button
              onClick={toggleModal}
              className="px-4 py-2 rounded-md bg-gradient-to-r 
                         from-customButton-gradientFrom
                         to-customButton-gradientTo
                         text-customButton-text
                         hover:bg-customButton-hoverBg
                         hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
              aria-label="Add new user"
            >
              <Plus size={16} />
              <span>Add User</span>
            </button> */}
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
                  flex: 1,
                  resizable: true,
                  sortable: true,
                  filter: true,
                  cellClass: "text-center text-[#2D3748] bg-white",
                }}
                pagination={true}
                paginationPageSize={paginationPageSize}
                domLayout="autoHeight"
                suppressCellSelection={true}
                onGridReady={onGridReady}
                rowHeight={50}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
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
