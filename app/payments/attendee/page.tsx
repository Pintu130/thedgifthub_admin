"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import ReactPaginate from "react-paginate"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import {
  Eye,
  Search,
  Calendar,
  X,
  Award,
  CreditCard,
  User,
  Building2,
  ClipboardList,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Utensils,
  Users,
  Clock,
  RefreshCw,
  RotateCcw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { DateRangePicker, type Range } from "react-date-range"
import { format } from "date-fns"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import RootLayout from "@/app/RootLayout"
import { useGetAttendeePaymentsQuery, useRefundAttendeePaymentMutation, type AttendeePaymentParams } from "@/lib/redux/features/post/postsApiSlice"
import { Badge } from "@/components/ui/badge"
import Modal from "@/components/common/Modal"
import { HiReceiptRefund } from "react-icons/hi";

const AttendeePaymentsPage = () => {
  const { toast } = useToast()

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isCustomRangeApplied, setIsCustomRangeApplied] = useState(false)

  // Date range state
  const [selectedDateRange, setSelectedDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    },
  ])

  const [appliedDateRange, setAppliedDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    },
  ])

  const [paginationParams, setPaginationParams] = useState<AttendeePaymentParams>({
    page: 1,
    limit: 20,
  })

  const { data: paymentsData, isLoading, isFetching, isError, refetch } = useGetAttendeePaymentsQuery(paginationParams)


  // Refund Modal States
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [selectedRefundPayment, setSelectedRefundPayment] = useState<any>(null)


  // Refund Mutation
  const [refundPayment, { isLoading: isRefunding }] = useRefundAttendeePaymentMutation()

  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  console.log("🚀 ~ AttendeePaymentsPage ~ selectedPayment:", selectedPayment)

  const isPaginationClickInProgress = useRef(false)
  const [isSearching, setIsSearching] = useState(false)
  const isSearchDisabled = !searchText && !isCustomRangeApplied
  const showLoader = isLoading || isFetching || isSearching || isRefunding


  const { startDate: appliedStartDate, endDate: appliedEndDate } = appliedDateRange[0]

  const handleSearch = () => {
    const newParams: AttendeePaymentParams = {
      ...paginationParams,
      page: 1,
      search: searchText || undefined,
      startDate: appliedStartDate ? appliedStartDate.toISOString() : undefined,
      endDate: appliedEndDate ? appliedEndDate.toISOString() : undefined,
    }
    setPaginationParams(newParams)
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setSearchText("")
    setSelectedDateRange([{ startDate: undefined, endDate: undefined, key: "selection" }])
    setAppliedDateRange([{ startDate: undefined, endDate: undefined, key: "selection" }])
    setIsCustomRangeApplied(false)
    setPaginationParams({ page: 1, limit: 20 })
    setCurrentPage(0)
  }

  useEffect(() => {
    if (!searchText && !isCustomRangeApplied) {
      clearFilters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, isCustomRangeApplied])

  const handleView = useCallback(
    (payment: any) => {
      setSelectedPayment(payment)
      setIsViewModalOpen(true)
    },
    [toast],
  )

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setSelectedPayment(null)
  }, [])

  // Refund Functions
  const handleRefund = useCallback(
    (payment: any) => {
      // if (!canRefundPayments) {
      //   toast({
      //     variant: "destructive",
      //     title: "Permission Denied",
      //     description: "You don't have permission to refund payments",
      //   })
      //   return
      // }

      // Check if payment can be refunded
      if (payment.payment?.status !== "completed") {
        toast({
          variant: "destructive",
          title: "Cannot Refund",
          description: "Only completed payments can be refunded",
        })
        return
      }

      setSelectedRefundPayment(payment)
      setIsRefundModalOpen(true)
    },
    [/* canRefundPayments, */ toast],
  )

  const closeRefundModal = useCallback(() => {
    setIsRefundModalOpen(false)
    setSelectedRefundPayment(null)
  }, [])

  const confirmRefund = useCallback(async () => {
    if (!selectedRefundPayment?.payment?.transactionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Transaction ID not found",
      })
      return
    }

    try {
      const result = await refundPayment({
        transactionId: selectedRefundPayment.payment.transactionId,
      }).unwrap()

      toast({
        title: "Success",
        description: result.messages || "Payment refunded successfully",
      })

      // Close modal and refresh data
      closeRefundModal()
      refetch()
    } catch (error: any) {
      console.error("Refund error:", error)
      toast({
        variant: "destructive",
        title: "Refund Failed",
        description: error?.data?.message || "Failed to process refund. Please try again.",
      })
    }
  }, [selectedRefundPayment, refundPayment, toast, closeRefundModal, refetch])

  const handlePageClick = (event: { selected: number }) => {
    if (isPaginationClickInProgress.current || isSearching) return
    isPaginationClickInProgress.current = true
    setIsSearching(true)
    const newPage = event.selected + 1
    setPaginationParams({ ...paginationParams, page: newPage })
    setCurrentPage(event.selected)
    setTimeout(() => {
      setIsSearching(false)
      isPaginationClickInProgress.current = false
    }, 1000)
  }

  // Date range functions
  const handleDateChange = (item: any) => {
    setSelectedDateRange([item.selection])
  }

  const handleApplyDateRange = () => {
    const { startDate, endDate } = selectedDateRange[0]
    if (startDate && endDate) {
      setAppliedDateRange(selectedDateRange)
      setIsCustomRangeApplied(true)
      setShowDatePicker(false)
    }
  }

  const handleCancelDateRange = () => {
    setSelectedDateRange(appliedDateRange)
    setShowDatePicker(false)
  }

  const handleClearDates = () => {
    const defaultRange: Range[] = [
      {
        startDate: undefined,
        endDate: undefined,
        key: "selection",
      },
    ]
    setSelectedDateRange(defaultRange)
    setAppliedDateRange(defaultRange)
    setIsCustomRangeApplied(false)
    setShowDatePicker(false)
  }

  const getDateRangeText = () => {
    const start = appliedStartDate
    const end = appliedEndDate
    if (start && end && isCustomRangeApplied) {
      return `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`
    }
    return "Select Date Range"
  }

  const exportToExcel = async () => {
    setIsSearching(true)

    try {
      const queryParams = new URLSearchParams()
      queryParams.append("limit", "1000")
      queryParams.append("page", "1")

      if (searchText?.trim()) {
        queryParams.append("search", searchText.trim())
      }
      if (appliedStartDate) {
        queryParams.append("startDate", appliedStartDate.toISOString())
      }
      if (appliedEndDate) {
        queryParams.append("endDate", appliedEndDate.toISOString())
      }

      const queryString = queryParams.toString()
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}payments/attendees?${queryString}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const paymentsData = await response.json()

      if (!paymentsData.data || !Array.isArray(paymentsData.data)) {
        throw new Error("Invalid data format received")
      }

      if (paymentsData.data.length === 0) {
        toast({
          variant: "destructive",
          title: "No Data",
          description: "No attendee payments data found to export.",
        })
        return
      }

      // Create comprehensive Excel data with ALL fields
      const worksheet = XLSX.utils.json_to_sheet(
        paymentsData.data.map((item: any) => ({
          // Payment Information
          "Payment ID": item.payment?._id || "",
          "Transaction ID": item.payment?.transactionId || "",
          Amount: item.payment?.amount || 0,
          "Payment Actual Amount": item.payment?.actualAmount || 0,
          Currency: item.payment?.currency || "",
          Status: item.payment?.status || "",
          "Payment Method": item.payment?.method || "",
          "Payer Model": item.payment?.payerModel || "",
          "Payee ID": item.payment?.payeeId || "",
          "Merchant ID": item.payment?.merchantId || "",
          "Requested At": item.payment?.requestedAt ? new Date(item.payment.requestedAt).toLocaleString() : "",
          "Completed At": item.payment?.completedAt ? new Date(item.payment.completedAt).toLocaleString() : "",
          "Payment Created At": item.payment?.createdAt ? new Date(item.payment.createdAt).toLocaleString() : "",
          "Payment Updated At": item.payment?.updatedAt ? new Date(item.payment.updatedAt).toLocaleString() : "",

          // Attendee Information
          "Attendee ID": item.payerDetails?._id || "",
          "First Name": item.payerDetails?.firstName || "",
          "Last Name": item.payerDetails?.lastName || "",
          Email: item.payerDetails?.email || "",
          Phone: item.payerDetails?.phone || "",
          "Cell Phone": item.payerDetails?.cellPhone || "",
          Institution: item.payerDetails?.Institution || "",
          "Primary Affiliation": item.payerDetails?.primaryAffiliation || "",
          "Primary Role": item.payerDetails?.primaryRoleintheIDeAPrograms || "",
          City: item.payerDetails?.city || "",
          State: item.payerDetails?.state || "",
          "Zip Code": item.payerDetails?.zipCode || "",
          "Street Address": item.payerDetails?.streetAddress || "",
          "Terms And Conditions": item.payerDetails?.termsAndConditions || "",
          "Payer Actual Amount": item.payerDetails?.actualAmount || 0,
          "Award Sponsorship": item.payerDetails?.awardSponsorship?.join(", ") || "",
          "Pre Conference Events": item.payerDetails?.preConferenceEvents?.join(", ") || "",

          // Food and Meal Planning
          "Dietary Restrictions": item.payerDetails?.foodAndMealPlanning?.vegetarian ? "Yes" : "No",
          Allergies: item.payerDetails?.foodAndMealPlanning?.allergies?.join(", ") || "",
          "Meal Questions":
            item.payerDetails?.foodAndMealPlanning?.mealQuestions
              ?.map((q: any) => `${q.question}: ${q.answer}`)
              .join(" | ") || "",

          // Registration Details
          "Registration Track": item.payerDetails?.registrationDetails?.track || "",
          "Ticket Type": item.payerDetails?.registrationDetails?.ticketType || "",
          "Selected Sessions":
            item.payerDetails?.registrationDetails?.selectedSessions
              ?.map((s: any) => `${s.day} ${s.session}: ${s.answer}`)
              .join(" | ") || "",

          // PayPal Information (if available)
          "PayPal Order ID": item.payment?.paypalJson?.id || "",
          "PayPal Intent": item.payment?.paypalJson?.intent || "",
          "PayPal Status": item.payment?.paypalJson?.status || "",
          "PayPal Payer Email": item.payment?.paypalJson?.payerDetails?.email_address || "",
          "PayPal Payer ID": item.payment?.paypalJson?.payerDetails?.payer_id || "",
          "PayPal Payer Name": item.payment?.paypalJson?.payerDetails?.name
            ? `${item.payment.paypalJson.payerDetails.name.given_name || ""} ${item.payment.paypalJson.payerDetails.name.surname || ""}`.trim()
            : "",
          "PayPal Country": item.payment?.paypalJson?.payerDetails?.address?.country_code || "",

          // Coupon Information
          "Coupon Used": item.coupon ? "Yes" : "No",
          "Coupon Details": item.coupon ? JSON.stringify(item.coupon) : "",

          // Timestamps
          "Attendee Created At": item.payerDetails?.createdAt
            ? new Date(item.payerDetails.createdAt).toLocaleString()
            : "",
          "Attendee Updated At": item.payerDetails?.updatedAt
            ? new Date(item.payerDetails.updatedAt).toLocaleString()
            : "",
        })),
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendee Payments")

      const fileName = `attendee-payments-complete-${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast({
        title: "Success",
        description: `${paymentsData.data.length} attendee payments with complete details exported successfully`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export attendee payments data. Please try again.",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <RootLayout>
      <div className="text-[#333]">
        {/* Custom CSS for Date Picker and Scrollbar */}
        <style jsx global>{`
          .rdrDay:not(.rdrDayPassive) .rdrDayNumber span {
            color: black !important;
          }
          .rdrDayToday .rdrDayNumber span:after {
            background: #A30000 !important;
          }
          .rdrInRange, .rdrStartEdge, .rdrEndEdge {
            background: #FFDEDE !important;
            color: #A30000 !important;
          }
          .rdrNextPrevButton {
            background: #FFDEDE !important;
            color: #A30000 !important;
          }
          .rdrNextPrevButton:hover {
            background: #FFEDED !important;
            color: #C70000 !important;
          }
          
          /* Custom scrollbar styles */
          .table-scroll-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .table-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .table-scroll-container::-webkit-scrollbar-thumb {
            background: #A30000;
            border-radius: 4px;
          }
          .table-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #800000;
          }
          .table-scroll-container::-webkit-scrollbar-corner {
            background: #f1f1f1;
          }
        `}</style>

        {/* Header - Fixed */}
        <div className="px-2 mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Attendee Payments Management</h1>
          <p className="text-sm text-[#7A6C53] mt-1">Manage attendee payment transactions</p>
        </div>

        {/* Summary Cards Section */}
        {paymentsData?.summary && (
          <div className="px-4 sm:px-6 lg:px-7 pb-4 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Total Amount Card */}
              <div className="bg-gradient-to-br from-customButton-gradientFrom to-customButton-gradientTo rounded-xl p-4 shadow-lg border border-bordercolor">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-customButton-text uppercase tracking-wide">Total Amount</p>
                    <p className="text-lg font-bold text-customButton-text mt-1">
                      ${paymentsData.summary.fullTotal?.toLocaleString()}.00
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-customButton-text/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-customButton-text" />
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 shadow-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Completed</p>
                    <p className="text-lg font-bold text-green-800 mt-1">
                      ${paymentsData.summary.completed?.toLocaleString()}.00
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 shadow-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Pending</p>
                    <p className="text-lg font-bold text-yellow-800 mt-1">
                      ${paymentsData.summary.pending?.toLocaleString()}.00
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Failed Card */}
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-4 shadow-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Failed</p>
                    <p className="text-lg font-bold text-red-800 mt-1">
                      ${paymentsData.summary.failed?.toLocaleString()}.00
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Refunded Card */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Refunded</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      ${paymentsData.summary.refunded?.toLocaleString()}.00
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Section - Flexible */}
        <Card className="shadow-lg border border-[#EADFC8] flex-1 flex flex-col min-h-0">
          {/* Header Section - Fixed */}
          <div className="flex flex-wrap flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 lg:px-7 pt-6 pb-4 flex-shrink-0">
            {/* Left Side - Title */}
            <div className="flex items-center ">
              <div>
                <CardTitle className="text-lg sm:text-xl text-[#4B3F2F]">All Attendee Payments</CardTitle>
                <p className="text-sm text-[#7A6C53] mt-1">{paymentsData?.meta?.total || 0} total payments</p>
              </div>
            </div>

            {/* Right Side - All Filters in One Line */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Excel Export Button */}
              <button
                onClick={exportToExcel}
                disabled={showLoader}
                className={`px-3 lg:px-4 py-2.5 rounded-md bg-green-600 text-white hover:bg-green-700 
                           font-semibold transition flex items-center justify-center gap-2 text-sm whitespace-nowrap
                           ${showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/732/732220.png" alt="Excel Icon" className="w-4 h-4" />
                <span className="hidden sm:inline">Download Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>

              {/* Date Range Picker */}
              <div className="relative">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 bg-[#FFF9F0] border-[#E5D5B7] hover:bg-[#FFFFFF] 
                               text-gray-900 justify-start text-sm py-2 px-3 whitespace-nowrap"
                    disabled={showLoader}
                  >
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden md:inline truncate">{getDateRangeText()}</span>
                    <span className="md:hidden">Date</span>
                  </Button>
                  {isCustomRangeApplied && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearDates}
                      className="h-9 w-9 p-0 hover:bg-[#FFF9F0] border border-[#E5D5B7] hover:border-[#D4C4A8] flex-shrink-0"
                      disabled={showLoader}
                    >
                      <X className="h-4 w-4 text-[#8B7355] hover:text-[#7A6C53]" />
                    </Button>
                  )}
                </div>

                {/* Date Range Picker Dropdown */}
                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-[#E5D5B7] rounded-lg shadow-lg p-4 w-[95vw] sm:w-[600px] max-w-[600px]">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Select Date Range</h3>
                    </div>

                    <div className="overflow-x-auto scrollbar-custom">
                      <DateRangePicker
                        onChange={handleDateChange}
                        showPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={window.innerWidth < 640 ? 1 : 2}
                        ranges={selectedDateRange}
                        direction="horizontal"
                        preventSnapRefocus={true}
                        calendarFocus="backwards"
                        minDate={new Date(2020, 0, 1)}
                        maxDate={new Date(2030, 11, 31)}
                        showMonthAndYearPickers={true}
                        rangeColors={["#A30000"]}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-pink-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelDateRange}
                        className="border-pink-200 text-pink-700 hover:bg-pink-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApplyDateRange}
                        className="bg-customButton-text hover:bg-[#800000] rounded-md transition-colors"
                        disabled={!selectedDateRange[0].startDate || !selectedDateRange[0].endDate}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search payments..."
                className="border outline-none p-2 rounded-md shadow-sm text-sm w-32 lg:w-48"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                disabled={showLoader}
              />

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isSearchDisabled || showLoader}
                className={`px-3 lg:px-4 py-2 rounded-md bg-gradient-to-r from-customButton-gradientFrom to-customButton-gradientTo
                           text-customButton-text hover:bg-customButton-hoverBg hover:text-customButton-hoverText 
                           font-semibold transition flex items-center justify-center gap-2 text-sm whitespace-nowrap
                           ${isSearchDisabled || showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Search size={16} />
                <span>Search</span>
              </button>

              {/* Clear Button */}
              {(searchText || isCustomRangeApplied) && (
                <button
                  onClick={clearFilters}
                  disabled={showLoader}
                  className={`px-3 lg:px-4 py-2 rounded-md bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FCA5A5] 
                             hover:text-[#7F1D1D] border border-[#FCA5A5] font-semibold transition 
                             flex items-center justify-center gap-2 text-sm whitespace-nowrap
                             ${showLoader ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Section - Scrollable */}
          <CardContent className="pt-6 relative flex-1 flex flex-col min-h-0">
            {showLoader && <Loader />}
            {isError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                <p>Failed to load attendee payments. Please try again later.</p>
              </div>
            )}

            {paymentsData?.data && paymentsData.data.length > 0 ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Table Container - Scrollable */}
                <div className="flex-1 min-h-0 ">
                  <div className="  h-full  border border-[#EADFC8] rounded-xl overflow-auto">
                    <table className="min-w-[1400px] w-full text-sm text-left table-fixed ">
                      <thead className="bg-[#FFEDED] text-[#800000] sticky top-0 z-10">
                        <tr>
                          <th className="p-3 font-semibold text-center w-[150px] border-b border-[#EADFC8]">Name</th>
                          <th className="p-3 font-semibold text-center w-[200px] border-b border-[#EADFC8]">Email</th>
                          <th className="p-3 font-semibold text-center w-[120px] border-b border-[#EADFC8]">Phone</th>
                          <th className="p-3 font-semibold text-center w-[150px] border-b border-[#EADFC8]">
                            Institution
                          </th>
                          <th className="p-3 font-semibold text-center w-[120px] border-b border-[#EADFC8]">
                            Affiliation
                          </th>
                          <th className="p-3 font-semibold text-center w-[100px] border-b border-[#EADFC8]">Amount</th>
                          <th className="p-3 font-semibold text-center w-[100px]">Status</th>
                          <th className="p-3 font-semibold text-center w-[120px] border-b border-[#EADFC8]">
                            Created Date
                          </th>
                          <th className="p-3 font-semibold text-center w-[100px] border-b border-[#EADFC8]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentsData?.data?.map((item: any) => (
                          <tr key={item.payment._id} className="border-t border-[#EADFC8]">
                            <td className="p-3 text-center text-[#4B3F2F] w-[150px] break-words">
                              <div className="font-semibold capitalize">
                                {item.payerDetails?.firstName} {item.payerDetails?.lastName}
                              </div>
                            </td>
                            <td className="p-3 text-center text-[#4B3F2F] w-[200px] break-words">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs">{item.payerDetails?.email}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs">{item.payerDetails?.phone}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center text-[#4B3F2F] w-[150px] break-words">
                              <span className="text-xs font-medium">{item.payerDetails?.Institution}</span>
                            </td>
                            <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                              <span className="text-xs">{item.payerDetails?.primaryAffiliation}</span>
                            </td>
                            <td className="p-3 text-center text-[#4B3F2F] w-[100px] break-words">
                              <div className="flex items-center justify-center gap-1">
                                <span className="font-semibold text-xs">
                                  ${item.payment?.amount?.toLocaleString() || 0}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center text-[#4B3F2F] w-[100px] break-words">
                              <div className="flex items-center justify-center gap-1">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border
                                              ${item?.payment?.status === "completed" && "bg-gradient-to-br from-green-100 to-green-200 border border-green-200 text-green-700"}
                                              ${item?.payment?.status === "pending" && "bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-200 text-yellow-700"}
                                              ${item?.payment?.status === "failed" && "bg-gradient-to-br from-red-100 to-red-200 border border-red-200 text-red-700"}
                                              ${item?.payment?.status === "refunded" && "bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 text-gray-700"}
                                            `}
                                >
                                  {item?.payment?.status
                                    ? item?.payment?.status.charAt(0).toUpperCase() + item?.payment?.status.slice(1)
                                    : "N/A"}
                                </span>
                              </div>
                            </td>


                            <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs">
                                  {new Date(item.payment?.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center w-[150px] break-words">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleView(item)}
                                  disabled={showLoader}
                                  className={`p-2 rounded-full bg-customButton-DEFAULT text-customButton-text hover:bg-customButton-hoverBg hover:text-customButton-hoverText transition-all duration-200 shadow-sm ${showLoader ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  title="View Payment Details"
                                >
                                  <Eye size={16} />
                                </button>
                                {/* Refund Button - Only show for completed payments */}

                                {item?.payment?.status === "completed" && (
                                  <button
                                    onClick={() => handleRefund(item)}
                                    disabled={showLoader || isRefunding}
                                     className={`p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-sm ${showLoader || isRefunding ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                    title="Refund Payment"
                                  >
                                    <HiReceiptRefund size={18} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination - Fixed at bottom */}
                <div className="mt-6 flex-shrink-0">
                  {paymentsData?.meta?.totalPages && paymentsData.meta.totalPages > 1 && (
                    <div className="flex justify-center">
                      <ReactPaginate
                        previousLabel={"←"}
                        nextLabel={"→"}
                        breakLabel={"..."}
                        pageCount={paymentsData?.meta?.totalPages || 1}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination flex gap-2"}
                        pageClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}
                        previousClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}
                        nextClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}
                        breakClassName={"border border-[#EADFC8] bg-white rounded cursor-pointer"}
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
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-500 text-center">
                    <h3 className="text-lg font-medium mb-2">No attendee payments found</h3>
                    <p className="text-sm">There are no attendee payments to display at the moment.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Refund Confirmation Modal */}
        <Modal
          isOpen={isRefundModalOpen}
          onClose={closeRefundModal}
          onConfirm={confirmRefund}
          title="Refund Payment"
          message={`Are you sure you want to refund this payment of $${selectedRefundPayment?.payment?.actualAmount?.toLocaleString()} for ${selectedRefundPayment?.payerDetails?.firstName} ${selectedRefundPayment?.payerDetails?.lastName}?`}
          closeLabel="Cancel"
          confirmLabel="Refund Payment"
          isLoading={isRefunding}
        />


        {/* Payment Details Modal */}
        {isViewModalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-[#ffeeee] px-8 py-6 border-b border-[#A30000]/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#A30000] rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#A30000]">Attendee Payment Details</h2>
                      <p className="text-[#A30000] mt-1">
                        Transaction ID:{" "}
                        <span className="font-mono text-sm">{selectedPayment.payment?.transactionId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-sm font-medium border-[#A30000] text-[#A30000] bg-white"
                    >
                      {selectedPayment.payment?.status?.toUpperCase()}
                    </Badge>
                    <Button
                      onClick={closeViewModal}
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-[#fff6f6]"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Main Content Grid - Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Attendee Information */}
                    <div className="space-y-6">
                      {/* Attendee Profile */}
                      <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                        <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                          <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                            <User className="w-4 h-4 text-[#A30000]" />
                            Attendee Profile
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="mb-4">
                            <h4 className="text-lg font-bold text-[#A30000] mb-1">
                              {selectedPayment.payerDetails?.firstName} {selectedPayment.payerDetails?.lastName}
                            </h4>
                            <p className="text-sm text-gray-600 font-medium">
                              {selectedPayment.payerDetails?.primaryRoleintheIDeAPrograms}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                              <Mail className="w-4 h-4 text-[#A30000]" />
                              <div>
                                <div className="text-xs text-[#A30000] uppercase font-medium">Email</div>
                                <div className="text-sm text-gray-800">{selectedPayment.payerDetails?.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                              <Phone className="w-4 h-4 text-[#A30000]" />
                              <div>
                                <div className="text-xs text-[#A30000] uppercase font-medium">Phone</div>
                                <div className="text-sm text-gray-800">{selectedPayment.payerDetails?.phone}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                              <Phone className="w-4 h-4 text-[#A30000]" />
                              <div>
                                <div className="text-xs text-[#A30000] uppercase font-medium">Cell Phone</div>
                                <div className="text-sm text-gray-800">{selectedPayment.payerDetails?.cellPhone}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                              <Building2 className="w-4 h-4 text-[#A30000]" />
                              <div>
                                <div className="text-xs text-[#A30000] uppercase font-medium">Institution</div>
                                <div className="text-sm text-gray-800">{selectedPayment.payerDetails?.Institution}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                              <GraduationCap className="w-4 h-4 text-[#A30000]" />
                              <div>
                                <div className="text-xs text-[#A30000] uppercase font-medium">Primary Affiliation</div>
                                <div className="text-sm text-gray-800">
                                  {selectedPayment.payerDetails?.primaryAffiliation}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 py-2">
                              <MapPin className="w-4 h-4 text-[#A30000]" />
                              <div>
                                <div className="text-xs text-[#A30000] uppercase font-medium">Address</div>
                                <div className="text-sm text-gray-800">
                                  {selectedPayment.payerDetails?.city}, {selectedPayment.payerDetails?.state}{" "}
                                  {selectedPayment.payerDetails?.zipCode}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Food and Meal Planning */}
                      {selectedPayment.payerDetails?.foodAndMealPlanning && (
                        <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                          <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                            <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                              <Utensils className="w-4 h-4 text-[#A30000]" />
                              Food & Meal Planning
                            </h3>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                                <Utensils className="w-4 h-4 text-[#A30000]" />
                                <div>
                                  <div className="text-xs text-[#A30000] uppercase font-medium">Vegetarian</div>
                                  <div className="text-sm text-gray-800">
                                    {selectedPayment.payerDetails.foodAndMealPlanning.vegetarian ? "Yes" : "No"}
                                  </div>
                                </div>
                              </div>
                              {selectedPayment.payerDetails.foodAndMealPlanning.allergies?.length > 0 && (
                                <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                                  <Award className="w-4 h-4 text-[#A30000]" />
                                  <div>
                                    <div className="text-xs text-[#A30000] uppercase font-medium">Allergies</div>
                                    <div className="text-sm text-gray-800">
                                      {selectedPayment.payerDetails.foodAndMealPlanning.allergies.join(", ")}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {selectedPayment.payerDetails.foodAndMealPlanning.mealQuestions?.map(
                                (question: any, index: number) => (
                                  <div key={index} className="border border-[#A30000]/30 rounded-lg p-3">
                                    <div className="text-xs text-[#A30000] uppercase font-medium mb-1">
                                      {question.question}
                                    </div>
                                    <div className="text-sm text-gray-800">{question.answer}</div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedPayment.payerDetails?.awardSponsorship?.length > 0 && (
                        <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                          <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                            <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                              <Award className="w-4 h-4 text-[#A30000]" />
                              Award Sponsorships
                            </h3>
                          </div>
                          <div className="p-4">
                            <div className="space-y-2">
                              {selectedPayment.payerDetails.awardSponsorship.map((award: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-[#ffeeee] rounded-lg">
                                  <Award className="w-3 h-3 text-[#A30000]" />
                                  <span className="text-xs font-medium text-gray-800">{award}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      )}
                      <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#ffeeee] px-6 py-4 border-b border-[#A30000]/30">
                          <h3 className="text-lg font-semibold text-[#A30000] flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-[#A30000]" />
                            Order Summary
                          </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 pt-6 pb-4">
                          {/* Table */}
                          <div className="overflow-auto rounded-md">
                            <table className="w-full border-collapse border border-gray-300">
                              <thead className="bg-red-50">
                                <tr>
                                  <th className="md:w-[240px] md:break-all text-left py-3 px-4 text-sm font-semibold text-[#A30000] uppercase  tracking-wide border border-gray-300">
                                    Item
                                  </th>
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#A30000] uppercase tracking-wide border border-gray-300">
                                    Discount
                                  </th>
                                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#A30000] uppercase tracking-wide border border-gray-300">
                                    Amount
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="hover:bg-gray-50">
                                  <td className="md:w-[240px] md:break-all py-3 px-4 text-gray-900 border border-gray-300">
                                    {selectedPayment.payerDetails?.postType}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700 border border-gray-300">
                                    {selectedPayment.coupon ? selectedPayment.coupon.discount + '%' : '0%'}
                                  </td>
                                  <td className="py-3 px-4 text-right font-semibold text-[#A30000] border border-gray-300">
                                    ${selectedPayment.payment?.amount?.toLocaleString()}.00
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>


                          {/* Summary Section */}
                          <div className="mt-6 pt-4 border-t border-[#A30000]/20">
                            <div className="space-y-3 text-sm sm:text-base">
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-800">Sub Total:</span>
                                <span className="text-gray-800">${selectedPayment.payment?.amount?.toLocaleString()}.00</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-800">Discount:</span>
                                <span className="text-gray-800">
                                  {selectedPayment.coupon ? selectedPayment.coupon.discount + '%' : '0%'}
                                </span>
                              </div>
                              <div className="flex justify-between text-lg font-bold border-t pt-3 border-dashed border-gray-300">
                                <span className="text-[#A30000]">Total :</span>
                                <span className="text-xl font-bold text-[#A30000]">
                                  ${selectedPayment.payment?.actualAmount?.toLocaleString()}.00
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column - Payment Details */}
                    <div className="space-y-6">
                      {/* Payment Details Table */}
                      <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                        <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                          <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#A30000]" />
                            Payment Details
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <tbody className="divide-y divide-[#A30000]/10">
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600 w-2/5">Total Amount</td>
                                  <td className="py-2 text-base font-bold text-[#A30000]">
                                    ${selectedPayment.payment?.actualAmount?.toLocaleString()}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Payment Method</td>
                                  <td className="py-2 text-xs font-semibold text-gray-800 capitalize">
                                    {selectedPayment.payment?.method}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Payment Status</td>
                                  <td className="py-2">
                                    <td className=" text-xs font-medium ">
                                      {selectedPayment.payment?.status?.toUpperCase()}
                                    </td>
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Transaction ID</td>
                                  <td className="py-2 text-xs font-mono text-gray-800 break-all">
                                    {selectedPayment.payment?.transactionId}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Requested Date</td>
                                  <td className="py-2 text-xs text-gray-800">
                                    {new Date(selectedPayment.payment?.requestedAt).toLocaleDateString()}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Completed Date</td>
                                  <td className="py-2 text-xs text-gray-800">
                                    {selectedPayment.payment?.completedAt
                                      ? new Date(selectedPayment.payment.completedAt).toLocaleDateString()
                                      : "Pending"}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Role</td>
                                  <td className="py-2 text-xs text-gray-800">{selectedPayment.payerDetails?.role}</td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Terms Accepted</td>
                                  <td className="py-2 text-xs text-gray-800">
                                    {selectedPayment.payerDetails?.termsAndConditions}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Payer ID</td>
                                  <td className="py-2 text-xs font-mono text-gray-800 break-all">
                                    {selectedPayment.payment?.payerId}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Payee ID</td>
                                  <td className="py-2 text-xs font-mono text-gray-800 break-all">
                                    {selectedPayment.payment?.payeeId}
                                  </td>
                                </tr>
                                <tr className="hover:bg-[#ffeeee]">
                                  <td className="py-2 text-xs font-medium text-gray-600">Merchant ID</td>
                                  <td className="py-2 text-xs font-mono text-gray-800 break-all">
                                    {selectedPayment.payment?.merchantId}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Registration Details */}
                      {selectedPayment.payerDetails?.registrationDetails?.selectedSessions && (
                        <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                          <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                            <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                              <ClipboardList className="w-4 h-4 text-[#A30000]" />
                              Registration Details
                            </h3>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3 mb-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 py-2 border-b border-[#A30000]/10">
                                  <div className="text-xs text-[#A30000] uppercase font-medium">Track</div>
                                  <div className="text-xs text-gray-800">
                                    {selectedPayment.payerDetails.registrationDetails.track}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 py-2 border-b border-[#A30000]/10">
                                  <div className="text-xs text-[#A30000] uppercase font-medium">Ticket Type</div>
                                  <div className="text-xs text-gray-800">
                                    {selectedPayment.payerDetails.registrationDetails.ticketType}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-[#A30000]">Selected Sessions</h4>
                              {selectedPayment.payerDetails.registrationDetails.selectedSessions.map(
                                (session: any, index: number) => (
                                  <div key={index} className="border border-[#A30000]/30 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold text-[#A30000] text-sm">
                                        {session.day} - {session.session}
                                      </h5>
                                      <Badge variant="outline" className="text-xs border-[#A30000]/30 text-[#A30000]">
                                        {session.time}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Q:</span>
                                        <span className="ml-1 text-gray-800">{session.question}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">A:</span>
                                        <span className="ml-1 text-gray-800 font-medium">{session.answer}</span>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Award Sponsorship */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-[#ffeeee] border-t border-[#A30000]/30 flex justify-between items-center flex-shrink-0">
                <div className="text-sm text-gray-600">
                  Registered: {new Date(selectedPayment.payerDetails?.createdAt).toLocaleDateString()}
                </div>
                <Button
                  onClick={closeViewModal}
                  className="px-6 py-2 bg-[#A30000] hover:bg-[#8F0000] text-white rounded-lg font-medium"
                >
                  Close Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  )
}

export default AttendeePaymentsPage
