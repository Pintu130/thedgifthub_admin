"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import type { ColDef } from "ag-grid-community"
import { collection, getDocs, doc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ViewEnquiryModal from "./ViewEnquiryModal"

interface Enquiry {
  id: string
  fullName: string
  city: string
  email: string
  phone: string
  enquiryDetails: string
  status: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

const EnquiryData = () => {
  const { toast } = useToast()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // View modal
  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null)

  // Details modal (for enquiry details)
  const [detailsEnquiry, setDetailsEnquiry] = useState<Enquiry | null>(null)

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Grid
  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(10)
  const [gridApi, setGridApi] = useState<any>(null)

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      let enquiryQuery: any = collection(db, "enquire")
      enquiryQuery = query(enquiryQuery, orderBy("createdAt", "desc"))

      const snapshot = await getDocs(enquiryQuery)
      const data = snapshot.docs.map((d) => {
        const raw = d.data() as any
        return {
          id: d.id,
          fullName: raw.fullName || "",
          city: raw.city || "",
          email: raw.email || "",
          phone: raw.phone || "",
          enquiryDetails: raw.enquiryDetails || "",
          status: raw.status || "pending",
          createdAt: raw.createdAt || null,
          updatedAt: raw.updatedAt || null,
        } as Enquiry
      })

      setEnquiries(data || [])
    } catch (error) {
      console.error("Error fetching enquiries:", error)
      setIsError(true)
      setEnquiries([])
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load enquiries. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchEnquiries()
  }, [fetchEnquiries])

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }

  const handleView = (enquiry: Enquiry) => {
    setViewEnquiry(enquiry)
  }

  const handleShowDetails = (enquiry: Enquiry) => {
    setDetailsEnquiry(enquiry)
  }

  const handleDelete = (enquiry: Enquiry) => {
    setEnquiryToDelete(enquiry)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!enquiryToDelete?.id) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "enquire", enquiryToDelete.id))
      toast({
        title: "Success",
        description: "Enquiry deleted successfully",
      })
      fetchEnquiries()
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Error deleting enquiry:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete enquiry. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Date cell renderer
  const DateCellRenderer = (params: any) => {
    if (!params.value) return "-"
    const date = params.value.toDate ? params.value.toDate() : new Date(params.value)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    })
  }

  const columnDefs: ColDef[] = [
    {
      headerName: "Full Name",
      field: "fullName",
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: "City",
      field: "city",
      flex: 0.8,
      minWidth: 100,
    },
    {
      headerName: "Email",
      field: "email",
      flex: 1.2,
      minWidth: 180,
    },
    {
      headerName: "Phone",
      field: "phone",
      flex: 0.8,
      minWidth: 120,
    },
    {
      headerName: "Enquiry Details",
      field: "enquiryDetails",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params: any) => {
        return (
          <div className="h-full flex items-center justify-center">
            <button
              onClick={() => handleShowDetails(params.data)}
              className="px-3 py-1 text-xs font-medium text-customButton-text bg-customButton hover:bg-[#FFD1D1] hover:text-[#800000] rounded-md transition-colors"
            >
              Show
            </button>
          </div>
        )
      },
    },
    {
      headerName: "Created At",
      field: "createdAt",
      width: 160,
      cellRenderer: DateCellRenderer,
    },
    {
      headerName: "Actions",
      field: "action",
      width: 100,
      cellRenderer: (params: any) => (
        <div className="h-full flex items-center justify-center gap-2">
          {/* <button
            onClick={() => handleView(params.data)}
            className="p-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
            title="View"
          >
            <Eye size={16} />
          </button> */}
          <button
            onClick={() => handleDelete(params.data)}
            className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Enquiries</h1>
        <p className="text-sm text-[#7A6C53] mt-1">View and manage all customer enquiries</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Enquiries</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{enquiries.length} total enquiries</p>
          </CardHeader>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search by email, full name, city..."
              className="border outline-none p-2 rounded-md shadow-sm w-64 lg:w-80"
              onChange={(e) => gridApi?.setQuickFilter(e.target.value)}
            />
          </div>
        </div>

        <CardContent className="pt-4">
          {isLoading && <Loader />}
          {isError && <p className="p-4 bg-red-50 text-red-700 rounded-md">Failed to load enquiries.</p>}
          {!isLoading && !isError && (
            <div className="ag-theme-alpine w-full">
              <AgGridReact
                ref={gridRef}
                rowData={enquiries}
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

      {/* View Modal */}
      <ViewEnquiryModal enquiry={viewEnquiry} onClose={() => setViewEnquiry(null)} />

      {/* Details Modal */}
      <Modal
        isOpen={!!detailsEnquiry}
        onClose={() => setDetailsEnquiry(null)}
        title="Enquiry Details"
        closeLabel="Close"
        width="40rem"
      >
        {detailsEnquiry && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{detailsEnquiry.enquiryDetails || "No details provided"}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default EnquiryData
