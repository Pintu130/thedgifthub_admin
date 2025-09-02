"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetCommitteesQuery,
  useDeleteCommitteesMutation,
  useUpdateCommitteesMutation,
  useReorderCommitteesMutation,
} from "@/lib/redux/features/post/postsApiSlice";
import Loader from "@/components/loading-screen";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Modal from "@/components/common/Modal";
import TableModalCommitteesData from "@/app/committees/TableModalCommitteesData";
import { ColDef, RowDragEndEvent } from "ag-grid-community";

interface CommitteeFormData {
  id?: string;
  name: string;
  description: string;
  image?: File | null;
  imagePreview?: string;
}

const CommitteesData = () => {
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useGetCommitteesQuery();
  const [deleteCommittee, { isLoading: isDeleting }] =
    useDeleteCommitteesMutation();
  const [updateCommittee, { isLoading: isUpdating }] = useUpdateCommitteesMutation()
  const [reorderCommittees, { isLoading: isReordering }] = useReorderCommitteesMutation()


  const gridRef = useRef<AgGridReact | null>(null);
  const [paginationPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [gridApi, setGridApi] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState<CommitteeFormData>({
    name: "",
    description: "",
    image: null,
    imagePreview: "",
  });

  // Loading state for individual status updates
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set())

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [committeeToDelete, setCommitteeToDelete] = useState<string | null>(
    null
  );


  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    if (gridApi) {
      gridApi.setQuickFilter(event.target.value);
    }
  };


  const onRowDragEnd = useCallback(
    async (event: RowDragEndEvent) => {

      const { node, overIndex } = event
      const draggedData = node.data
      const startIndex = draggedData.order
      const endIndex = overIndex + 1

      if (startIndex === endIndex) return

      try {
        const response = await reorderCommittees({
          startIndex,
          endIndex,
        }).unwrap()

        toast({
          title: "Success",
          description: response?.message || "Committees reordered successfully",
        })

        refetch()
      } catch (error: any) {
        const errorMessage =
          error?.data?.messages || error?.data?.message || error?.error || "Failed to reorder committees"

        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      }
    },
    [reorderCommittees, toast, refetch],
  )


  // Handle status toggle using the existing updateCommittees mutation
  const handleStatusToggle = useCallback(
    async (committee: any) => {

      const newActivity = committee.activity === 1 ? 0 : 1
      const committeeId = committee._id

      // Add to loading set
      setUpdatingStatusIds((prev) => new Set(prev).add(committeeId))

      try {
        // Create FormData for the update
        const formData = new FormData()
        formData.append("name", committee.name)
        formData.append("description", committee.description)
        formData.append("activity", newActivity.toString())

        const response = await updateCommittee({
          id: committeeId,
          formData,
        }).unwrap()

        toast({
          title: "Success",
          description: `Committee status ${newActivity === 1 ? "activated" : "deactivated"} successfully`,
        })

        refetch()
      } catch (error: any) {
        const errorMessage = error?.data?.messages || error?.data?.message || error?.error || "Failed to update status"

        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setUpdatingStatusIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(committeeId)
          return newSet
        })
      }
    },
    [updateCommittee, toast, refetch],
  )

  const toggleModal = useCallback(() => {

    setFormData({
      name: "",
      description: "",
      image: null,
      imagePreview: "",
    });
    setIsModalVisible(!isModalVisible);
  }, [isModalVisible, toast]);

  const handleEdit = useCallback(
    (committee: any) => {
      setFormData({
        id: committee._id,
        name: committee.name,
        description: committee.description,
        image: null,
        imagePreview: committee.image, // Set existing image URL for preview
      });
      setIsModalVisible(true);
    },
    [toast]
  );

  // Open delete confirmation modal
  const handleDelete = useCallback(
    (id: string) => {
      setCommitteeToDelete(id);
      setIsDeleteModalOpen(true);
    },
    [toast]
  );

  // Close delete confirmation modal
  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCommitteeToDelete(null);
  }, []);

  // Confirm and execute delete
  const confirmDelete = useCallback(async () => {
    if (!committeeToDelete) return;

    try {
      const response = await deleteCommittee(committeeToDelete).unwrap();
      toast({
        title: "Success",
        description: response?.message || "Committee deleted successfully",
      });
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.messages ||
        error?.data?.message ||
        error?.error ||
        "Something went wrong";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      closeDeleteModal();
    }
  }, [committeeToDelete, deleteCommittee, refetch, toast, closeDeleteModal]);

  const refreshGridData = useCallback(() => {
    refetch();
  }, [refetch]);


  const columnDefs = [
    {
      headerName: "Order",
      field: "order",
      width: 40,
      maxWidth: 80,
      minWidth: 60,
      suppressMenu: true,
      suppressSorting: true,
      suppressFilter: true,
      suppressResize: true,

    },
    {
      headerName: "Image",
      field: "image",
      sortable: false,
      filter: false,
      resizable: true,
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full py-2">
          <img
            src={params.value || "/placeholder.svg?height=40&width=40"}
            alt={params.data.name}
            className="w-8 h-8 rounded-sm"
          />
        </div>
      ),
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1.3,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-900">{params.value}</p>
        </div>
      ),
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
      resizable: true,
      flex: 3,
      minWidth: 250,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full w-full">
          <div
            className="text-sm text-gray-700 w-full line-clamp-1 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: params.value }}
          />
        </div>
      ),
    },
    {
      headerName: "Status",
      field: "activity",
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 120,
      headerClass: "custom-header",
      cellRenderer: (params: any) => {
        const isActive = params.value === 1;
        const committeeId = params.data._id;
        const isUpdating = updatingStatusIds.has(committeeId);

        return (
          <div className="flex items-center justify-center h-full">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                disabled={isUpdating}
                onChange={() => handleStatusToggle(params.data)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#FFC0C0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#C70000] peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFC0C0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#FFB3B3] peer-checked:to-[#C70000] peer-disabled:opacity-50"></div>
            </label>
          </div>
        );
      },
    },
{
      headerName: "Action",
      field: "action",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filter: false,
      headerClass: "custom-header action-header",
      cellClass: "flex justify-center items-center text-center bg-white",
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center gap-3 h-full">
            <button
              onClick={() => handleEdit(params.data)}
              className="p-1 rounded-full bg-[#EBF5FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] transition"
              aria-label="Edit committee"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(params.data._id)}
              className="p-1 rounded-full bg-[#F8E6E6] text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#B91C1C] transition"
              aria-label="Delete committee"
            >
              <Trash2 size={16} />
            </button>
        </div>
      ),
    },
  ].filter(Boolean) as ColDef[];

  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">
          Committees
        </h1>
        <p className="text-sm text-[#7A6C53] mt-1">
          Manage all committees and their information
        </p>
      </div>

      <Card className="shadow-md border border-[#EADFC8]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-[#2D3748]">
              All Committees
            </CardTitle>
            <p className="text-sm text-[#7A6C53] mt-1">
              {data?.data?.length || 0} total committees
            </p>
          </CardHeader>

          {/* Search + Add Committee */}
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search committees..."
              className="border outline-none p-2 rounded-md shadow-sm w-w-52 lg:w-64"
              value={searchText}
              onChange={onSearchTextChange}
              aria-label="Search committees"
            />
              <button
                onClick={toggleModal}
                className="px-4 py-2 rounded-md bg-gradient-to-r 
                           from-customButton-gradientFrom
                           to-customButton-gradientTo
                           text-customButton-text
                           hover:bg-customButton-hoverBg
                           hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
                aria-label="Add new committee"
              >
                <Plus size={16} />
                <span>Add Committee</span>
              </button>
          </div>
        </div>

        <CardContent className="pt-4">
          {(isLoading || isDeleting || isUpdating || isReordering) && <Loader />}
          {isError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p>Failed to load committees. Please try again later.</p>
            </div>
          )}
          {data && (
            <div className="ag-theme-alpine w-full">
              <div>
                <AgGridReact
                  ref={gridRef}
                  columnDefs={columnDefs}
                  rowData={data?.data}
                  defaultColDef={{
                    flex: 1,
                    resizable: true,
                    sortable: true,
                    cellClass: "text-center text-[#2D3748] bg-white",
                    headerClass: "custom-header",
                  }}
                  // pagination={true}
                  paginationPageSize={paginationPageSize}
                  domLayout="autoHeight"
                  suppressCellSelection={true}
                  onGridReady={onGridReady}
                  rowSelection="single"
                  animateRows={true}
                  rowHeight={50} // Increased row height for better image display
                  rowDragManaged={true}
                  onRowDragEnd={onRowDragEnd}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Committee Form Modal */}
      <TableModalCommitteesData
        isModalVisible={isModalVisible}
        onClose={toggleModal}
        title={formData.id ? "Edit Committee" : "Add Committee"}
        closeLabel="Cancel"
        saveLabel={formData.id ? "Update" : "Save"}
        formData={formData}
        setFormData={setFormData}
        getTotalCommittees={refreshGridData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Committee"
        message="Are you sure you want to delete this committee?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CommitteesData;
