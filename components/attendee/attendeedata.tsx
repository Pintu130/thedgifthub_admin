"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetAttendeesQuery,
  useDeleteAttendeeMutation,
  useUpdateAttendeeMutation,
  UpdateAttendeeRequest,
  Attendee,
} from "@/lib/redux/features/post/postsApiSlice";
import Loader from "@/components/loading-screen";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Modal from "@/components/common/Modal";
import AttendeeEditModal from "@/app/attendee/AttendeeEditModal";
import * as XLSX from "xlsx";

interface AttendeeFormData {
  id: string;
  firstName: string;
  lastName: string;
  Institution: string;
  primaryAffiliation: string;
  phone: number;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  primaryRoleintheIDeAPrograms: string;
  email: string;
  cellPhone: number;
  termsAndConditions: string;
  foodAndMealPlanning: {
    vegetarian: boolean;
    allergies: string[];
  };
  registrationDetails: {
    track: string;
    ticketType: string;
  };
  preConferenceEvents: number[];
  awardSponsorship: number[];
  discountCoupon: string;
  actualAmount: number;
  createdAt: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

const AttendeeDataTable = () => {
  const { toast } = useToast();

  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 20,
  });

  const {
    data: attendeesData,
    isLoading,
    isFetching,
    isError,
    refetch,
  }: any = useGetAttendeesQuery(paginationParams);
  const [deleteAttendee, { isLoading: isDeleting }] =
    useDeleteAttendeeMutation();
  const [updateAttendee, { isLoading: isUpdating }] = useUpdateAttendeeMutation()

  // Loading state for individual status updates
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set())

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState<AttendeeFormData>({
    id: "",
    firstName: "",
    lastName: "",
    Institution: "",
    primaryAffiliation: "",
    phone: 0,
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    primaryRoleintheIDeAPrograms: "",
    email: "",
    cellPhone: 0,
    termsAndConditions: "",
    foodAndMealPlanning: {
      vegetarian: false,
      allergies: [],
    },
    registrationDetails: {
      track: "",
      ticketType: "",
    },
    preConferenceEvents: [],
    awardSponsorship: [],
    discountCoupon: "",
    actualAmount: 0,
    createdAt: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attendeeToDelete, setAttendeeToDelete] = useState<string | null>(null);

  const isPaginationClickInProgress = useRef(false);
  const [isSearching, setIsSearching] = useState(false);
  const isSearchDisabled = !searchText;
  const showLoader = isLoading || isFetching || isDeleting || isUpdating || isSearching;



  // Handle status toggle
  const handleStatusToggle = useCallback(
    async (attendee: Attendee) => {
      

      const newActivity = attendee.activity === 1 ? 0 : 1
      const attendeeId = attendee._id

      setUpdatingStatusIds((prev) => new Set(prev).add(attendeeId))

      try {
        const updateData: UpdateAttendeeRequest = {
          ...attendee,
          id: attendee._id,
          activity: newActivity,
        }

        const response = await updateAttendee(updateData).unwrap()

        toast({
          title: "Success",
          description: `Attendee status ${newActivity === 1 ? "activated" : "deactivated"} successfully`,
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
          newSet.delete(attendeeId)
          return newSet
        })
      }
    },
    [ updateAttendee, toast, refetch],
  )

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

  const handleEdit = useCallback(
    (attendee: any) => {
      setFormData({
        id: attendee._id,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        Institution: attendee.Institution,
        primaryAffiliation: attendee.primaryAffiliation,
        phone: attendee.phone,
        streetAddress: attendee.streetAddress,
        city: attendee.city,
        state: attendee.state,
        zipCode: attendee.zipCode,
        primaryRoleintheIDeAPrograms: attendee.primaryRoleintheIDeAPrograms,
        email: attendee.email,
        cellPhone: attendee.cellPhone,
        termsAndConditions: attendee.termsAndConditions,
        foodAndMealPlanning: attendee.foodAndMealPlanning || {
          vegetarian: false,
          allergies: [],
        },
        registrationDetails: attendee.registrationDetails || {
          track: "",
          ticketType: "",
        },
        preConferenceEvents: attendee.preConferenceEvents || [],
        awardSponsorship: attendee.awardSponsorship || [],
        discountCoupon: attendee.discountCoupon,
        actualAmount: attendee.actualAmount,
        createdAt: attendee.createdAt,
      });
      setIsModalVisible(true);
    },
    [toast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setAttendeeToDelete(id);
      setIsDeleteModalOpen(true);
    },
    [toast]
  );

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setAttendeeToDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!attendeeToDelete) return;
    try {
      const resp = await deleteAttendee(attendeeToDelete).unwrap();
      toast({
        title: "Success",
        description: resp.message || "Attendee deleted successfully",
      });
      refetch();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.data?.message || err?.error || "Failed to delete attendee",
      });
    } finally {
      closeDeleteModal();
    }
  }, [attendeeToDelete, deleteAttendee, refetch, toast, closeDeleteModal]);

  const closeModal = () => {
    setIsModalVisible(false);
    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      Institution: "",
      primaryAffiliation: "",
      phone: 0,
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      primaryRoleintheIDeAPrograms: "",
      email: "",
      cellPhone: 0,
      termsAndConditions: "",
      foodAndMealPlanning: {
        vegetarian: false,
        allergies: [],
      },
      registrationDetails: {
        track: "",
        ticketType: "",
      },
      preConferenceEvents: [],
      awardSponsorship: [],
      discountCoupon: "",
      actualAmount: 0,
      createdAt: "",
    });
  };

  const refreshGridData = useCallback(() => {
    refetch();
  }, [refetch]);

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

  const exportToExcel = async () => {
    setIsSearching(true);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", "1000");
      queryParams.append("page", "1");

      if (searchText?.trim()) {
        queryParams.append("search", searchText.trim());
      }

      const queryString = queryParams.toString();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}attendee?${queryString}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const attendeeData = await response.json();

      if (!attendeeData.data || !Array.isArray(attendeeData.data)) {
        throw new Error("Invalid data format received");
      }

      if (attendeeData.data.length === 0) {
        toast({
          variant: "destructive",
          title: "No Data",
          description: "No attendees data found to export.",
        });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        attendeeData.data.map((attendee: any) => ({
          "First Name": attendee.firstName || "",
          "Last Name": attendee.lastName || "",
          Email: attendee.email || "",
          Phone: attendee.phone || "",
          "Cell Phone": attendee.cellPhone || "",
          Institution: attendee.Institution || "",
          "Primary Affiliation": attendee.primaryAffiliation || "",
          "Primary Role in IDeA Programs":
            attendee.primaryRoleintheIDeAPrograms || "",
          City: attendee.city || "",
          State: attendee.state || "",
          "Street Address": attendee.streetAddress || "",
          "ZIP Code": attendee.zipCode || "",
          Track: attendee.registrationDetails?.track || "",
          "Ticket Type": attendee.registrationDetails?.ticketType || "",
          "Food Preference (Vegetarian)": attendee.foodAndMealPlanning
            ?.vegetarian
            ? "Yes"
            : "No",
          Allergies: attendee.foodAndMealPlanning?.allergies?.join(", ") || "",
          "Pre-Conference Events":
            attendee.preConferenceEvents?.join(", ") || "",
          "Award Sponsorship": attendee.awardSponsorship?.join(", ") || "",
          "Discount Coupon": attendee.discountCoupon || "",
          "Actual Amount": attendee.actualAmount || 0,
          "Terms Accepted":
            attendee.termsAndConditions === "accepted" ? "Yes" : "No",
          "Created At": attendee.createdAt
            ? new Date(attendee.createdAt).toLocaleString()
            : "",
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");

      const fileName = `attendees-data-${new Date().toISOString().split("T")[0]
        }.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Success",
        description: `${attendeeData.data.length} attendees exported successfully`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to export attendees data. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="text-[#333]">
      {/* Header */}
      <div className="px-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">
          Attendees Management
        </h1>
        <p className="text-sm text-[#7A6C53] mt-1">Manage event attendees</p>
      </div>

      {/* Card Section */}
      <Card className="shadow-lg border border-[#EADFC8]">
        <div className="flex flex-wrap flex-col md:flex-row md:justify-between md:items-center px-7 pt-4 gap-4">
          <div>
            <CardHeader className="p-0">
              <CardTitle className="text-lg text-[#4B3F2F]">
                All Attendees
              </CardTitle>
              <p className="text-sm text-[#7A6C53] mt-1">
                {attendeesData?.meta?.total || 0} total attendees
              </p>
            </CardHeader>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto lg:flex-nowrap">
            {/* Excel Export Button */}
            <button
              onClick={exportToExcel}
              disabled={showLoader}
              className={`px-4 py-2 rounded-md bg-green-600 text-white
                     hover:bg-green-700 font-semibold transition w-full sm:w-auto flex items-center justify-center gap-2
                     ${showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                alt="Excel Icon"
                className="w-5 h-5"
              />
              <span>Download Attendees Excel</span>
            </button>
            <input
              type="text"
              placeholder="Search attendees..."
              className="border outline-none p-2 rounded-md shadow-sm w-full sm:flex-1 md:w-48 xl:w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={showLoader}
            />
            <button
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
            </button>
            {searchText && (
              <button
                onClick={clearFilters}
                disabled={showLoader}
                className={`px-4 py-2 rounded-md bg-[#FEE2E2] text-[#B91C1C] 
                  hover:bg-[#FCA5A5] hover:text-[#7F1D1D] border border-[#FCA5A5] 
                  font-semibold transition w-full sm:w-auto flex items-center justify-center gap-2 
                  ${showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <CardContent className="pt-6 relative">
          {showLoader && <Loader />}
          {isError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p>Failed to load attendees. Please try again later.</p>
            </div>
          )}

          {attendeesData?.data?.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-x-auto border border-[#EADFC8] rounded-xl">
                  <table className="min-w-[1400px] w-full text-sm text-left table-fixed">
                    <thead className="bg-[#FFEDED] text-[#800000]">
                      <tr>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Name
                        </th>
                        <th className="p-3 font-semibold text-center w-[200px]">
                          Email
                        </th>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Phone
                        </th>
                        <th className="p-3 font-semibold text-center w-[150px]">
                          Institution
                        </th>
                        <th className="p-3 font-semibold text-center w-[150px]">
                          Primary Affiliation
                        </th>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Location
                        </th>
                        <th className="p-3 font-semibold text-center w-[100px]">
                          Amount
                        </th>
                        <th className="p-3 font-semibold text-center w-[100px]">
                          Terms
                        </th>
                        <th className="p-3 font-semibold text-center w-[100px]">
                          Status
                        </th>
                        <th className="p-3 font-semibold text-center w-[120px]">
                          Created Date
                        </th>
                          <th className="p-3 font-semibold text-center w-[100px]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendeesData.data.map((attendee: any) => (
                        <tr
                          key={attendee._id}
                          className="border-t border-[#EADFC8] hover:bg-gray-50"
                        >
                          <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                            <div className="font-semibold capitalize">
                              {attendee.firstName} {attendee.lastName}
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[200px] break-words">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs">{attendee.email}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs">
                                  {attendee.phone}
                                </span>
                              </div>
                              {attendee.cellPhone && (
                                <div className="text-xs text-gray-500">
                                  Cell: {attendee.cellPhone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[150px] break-words">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs">
                                {attendee.Institution}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[150px] break-words">
                            <span className="text-xs">
                              {attendee.primaryAffiliation}
                            </span>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                            <div className="flex items-center justify-center gap-1">
                              <div className="text-xs">
                                <div>
                                  {attendee.city}, {attendee.state}
                                </div>
                                <div className="text-gray-500">
                                  {attendee.zipCode}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[100px] break-words">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-semibold text-xs">
                                ${attendee.actualAmount?.toLocaleString() || 0}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[100px] break-words">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${attendee.termsAndConditions === "true"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                                }`}
                            >
                              {attendee.termsAndConditions === "true"
                                ? "Accepted"
                                : "Pending"}
                            </span>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[100px] break-words">
                              <div className="flex items-center justify-center h-full">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={attendee.activity === 1}
                                    disabled={updatingStatusIds.has(attendee._id)}
                                    onChange={() => handleStatusToggle(attendee)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-[#FFC0C0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#C70000] peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFC0C0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#FFB3B3] peer-checked:to-[#C70000] peer-disabled:opacity-50"></div>
                                </label>
                              </div>
                          </td>
                          <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs">
                                {new Date(
                                  attendee.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>
                            <td className="p-3 text-center w-[100px] break-words">
                              <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(attendee)}
                                    disabled={showLoader}
                                    className={`p-1 rounded-full bg-[#EBF5FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] transition ${showLoader ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                    title="Edit Attendee"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(attendee._id)}
                                    disabled={showLoader}
                                    className={`p-1 rounded-full bg-[#F8E6E6] text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#B91C1C] transition ${showLoader ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                    title="Delete Attendee"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                              </div>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  {attendeesData?.meta?.totalPages > 1 && (
                    <div className="flex justify-center">
                      <ReactPaginate
                        previousLabel={"←"}
                        nextLabel={"→"}
                        breakLabel={"..."}
                        pageCount={attendeesData.meta.totalPages}
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
                  <h3 className="text-lg font-medium mb-2">
                    No attendees found
                  </h3>
                  <p className="text-sm">
                    There are no attendees to display at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <AttendeeEditModal
        isModalVisible={isModalVisible}
        onClose={closeModal}
        formData={formData}
        setFormData={setFormData}
        refreshAttendees={refreshGridData}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Attendee"
        message="Are you sure you want to delete this attendee?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AttendeeDataTable;
