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
    Trophy,
    Award,
    CreditCard,
    Users,
    Gift,
    User,
    ClipboardList,
    Mail,
    Phone,
    Globe,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker, type Range } from "react-date-range"
import { format } from "date-fns"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import RootLayout from "../../RootLayout"
import { useGetSponsorPaymentsQuery, useRefundSponsorPaymentsMutation } from "@/lib/redux/features/post/postsApiSlice"
import { Badge } from "@/components/ui/badge"
import { HiReceiptRefund } from "react-icons/hi"
import Modal from "@/components/common/Modal"

interface SponsorPaymentParams {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
    type?: string
    sponsorType?: string
}

const SponsorPaymentsPage = () => {
    const { toast } = useToast()

    const [searchText, setSearchText] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [isCustomRangeApplied, setIsCustomRangeApplied] = useState(false)
    const [selectedType, setSelectedType] = useState<string>("")
    const [selectedSponsorType, setSelectedSponsorType] = useState<string>("")

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

    const [paginationParams, setPaginationParams] = useState<SponsorPaymentParams>({
        page: 1,
        limit: 20,
    })

    const {
        data: paymentsData,
        isLoading,
        isFetching,
        isError,
        refetch,
    }: any = useGetSponsorPaymentsQuery(paginationParams)


    // Refund Modal States
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
    const [selectedRefundPayment, setSelectedRefundPayment] = useState<any>(null)


    // Refund Mutation
    const [refundPayment, { isLoading: isRefunding }] = useRefundSponsorPaymentsMutation()

    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<any>(null)
    console.log("🚀 ~ SponsorPaymentsPage ~ selectedPayment:", selectedPayment)

    const isPaginationClickInProgress = useRef(false)
    const [isSearching, setIsSearching] = useState(false)
    const isSearchDisabled = !searchText && !selectedType && !selectedSponsorType && !isCustomRangeApplied
    const showLoader = isLoading || isFetching || isSearching || isRefunding


    const { startDate: appliedStartDate, endDate: appliedEndDate } = appliedDateRange[0]

    const handleSearch = () => {
        const newParams: SponsorPaymentParams = {
            ...paginationParams,
            page: 1,
            search: searchText || undefined,
            type: selectedType || undefined,
            sponsorType: selectedSponsorType || undefined,
            startDate: appliedStartDate ? appliedStartDate.toISOString() : undefined,
            endDate: appliedEndDate ? appliedEndDate.toISOString() : undefined,
        }
        setPaginationParams(newParams)
        setCurrentPage(0)
    }

    const clearFilters = () => {
        setSearchText("")
        setSelectedType("")
        setSelectedSponsorType("")
        setSelectedDateRange([{ startDate: undefined, endDate: undefined, key: "selection" }])
        setAppliedDateRange([{ startDate: undefined, endDate: undefined, key: "selection" }])
        setIsCustomRangeApplied(false)
        setPaginationParams({ page: 1, limit: 20 })
        setCurrentPage(0)
    }

    useEffect(() => {
        if (!searchText && !selectedType && !selectedSponsorType && !isCustomRangeApplied) {
            clearFilters()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, selectedType, selectedSponsorType, isCustomRangeApplied])

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
            if (selectedType) {
                queryParams.append("type", selectedType)
            }
            if (selectedSponsorType) {
                queryParams.append("sponsorType", selectedSponsorType)
            }
            if (appliedStartDate) {
                queryParams.append("startDate", appliedStartDate.toISOString())
            }
            if (appliedEndDate) {
                queryParams.append("endDate", appliedEndDate.toISOString())
            }

            const queryString = queryParams.toString()
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}payments/sponsors?${queryString}`, {
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
                    description: "No sponsor payments data found to export.",
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
                    "Actual Amount": item.payment?.actualAmount || 0,
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

                    // Payer/Sponsor Information
                    "Payer ID": item.payerDetails?._id || "",
                    "First Name": item.payerDetails?.firstName || "",
                    "Last Name": item.payerDetails?.lastName || "",
                    Email: item.payerDetails?.email || "",
                    Phone: item.payerDetails?.phone || "",
                    "Company Name": item.payerDetails?.companyName || "",
                    "Company Description": item.payerDetails?.companyDescription || "",
                    "Website URL": item.payerDetails?.websiteUrl || "",
                    "Sponsorship Tier": item.payerDetails?.sponsorshipTier || "",
                    Type: item.payerDetails?.type || "",
                    "Sponsor Type": item.payerDetails?.sponsorType || "",
                    "Terms And Conditions": item.payerDetails?.termsAndConditions || "",
                    "Image URL": item.payerDetails?.image || "",
                    "Payer Actual Amount": item.payerDetails?.actualAmount || 0,
                    "Award Sponsorship": item.payerDetails?.awardSponsorship?.join(", ") || "",
                    "Payer Created At": item.payerDetails?.createdAt
                        ? new Date(item.payerDetails.createdAt).toLocaleString()
                        : "",
                    "Payer Updated At": item.payerDetails?.updatedAt
                        ? new Date(item.payerDetails.updatedAt).toLocaleString()
                        : "",

                    // Registration Details
                    "Registration Level": item.payerDetails?.registrationDetails?.selectedSessions?.[0]?.Level || "",
                    "Registration Fee": item.payerDetails?.registrationDetails?.selectedSessions?.[0]?.Fee || "",
                    "Registration Booth": item.payerDetails?.registrationDetails?.selectedSessions?.[0]?.Booth || "",
                    "Registration Extras": item.payerDetails?.registrationDetails?.selectedSessions?.[0]?.Extras || "",
                    "Registration Count": item.payerDetails?.registrationDetails?.selectedSessions?.[0]?.Registrations || "",
                    "Registration Recognition": item.payerDetails?.registrationDetails?.selectedSessions?.[0]?.Recognition || "",

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
                })),
            )

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sponsor Payments")

            const fileName = `sponsor-payments-complete-${new Date().toISOString().split("T")[0]}.xlsx`
            XLSX.writeFile(workbook, fileName)

            toast({
                title: "Success",
                description: `${paymentsData.data.length} sponsor payments with complete details exported successfully`,
            })
        } catch (error) {
            console.error("Export error:", error)
            toast({
                variant: "destructive",
                title: "Export Failed",
                description:
                    error instanceof Error ? error.message : "Failed to export sponsor payments data. Please try again.",
            })
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <RootLayout>
            <div className="text-[#333] ">
                {/* Custom CSS for Date Picker */}
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
        `}</style>

                {/* Header */}
                <div className="px-2 mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Sponsor Payments Management</h1>
                    <p className="text-sm text-[#7A6C53] mt-1">Manage sponsor payment transactions</p>
                </div>
                {/* Summary Cards Section */}
                {paymentsData?.summary && (
                    <div className="px-4 sm:px-6 lg:px-7 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {/* Total Amount Card */}
                            <div className="bg-gradient-to-br from-customButton-gradientFrom to-customButton-gradientTo rounded-xl p-4 border border-bordercolor shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-customButton-text uppercase tracking-wide">Total Amount</p>
                                        <p className="text-lg font-bold text-customButton-text mt-1">
                                            ${paymentsData.summary.fullTotal?.toLocaleString()}.00
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-customButton-text" />
                                    </div>
                                </div>
                            </div>

                            {/* Completed Payments Card */}
                            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border border-green-300 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-green-800 uppercase tracking-wide">Completed</p>
                                        <p className="text-lg font-bold text-green-800 mt-1">
                                            ${paymentsData.summary.completed?.toLocaleString()}.00
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                                        <Trophy className="w-5 h-5 text-green-700" />
                                    </div>
                                </div>
                            </div>

                            {/* Pending Payments Card */}
                            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 border border-yellow-300 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-yellow-800 uppercase tracking-wide">Pending</p>
                                        <p className="text-lg font-bold text-yellow-800 mt-1">
                                            ${paymentsData.summary.pending?.toLocaleString()}.00
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-yellow-700" />
                                    </div>
                                </div>
                            </div>

                            {/* Failed Payments Card */}
                            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-4 border border-red-300 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-red-800 uppercase tracking-wide">Failed</p>
                                        <p className="text-lg font-bold text-red-800 mt-1">
                                            ${paymentsData.summary.failed?.toLocaleString()}.00
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                                        <X className="w-5 h-5 text-red-700" />
                                    </div>
                                </div>
                            </div>

                            {/* Refunded Payments Card */}
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 border border-gray-300 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-800 uppercase tracking-wide">Refunded</p>
                                        <p className="text-lg font-bold text-gray-800 mt-1">
                                            ${paymentsData.summary.refunded?.toLocaleString()}.00
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                                        <Gift className="w-5 h-5 text-gray-700" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Card Section */}
                <Card className="shadow-lg border border-[#EADFC8]">
                    {/* Header Section - Single Row Layout */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 lg:px-7 pt-6 pb-4">
                        {/* Left Side - Title */}
                        <div className="flex items-center lg:w-2/4">
                            <div>
                                <CardTitle className="text-lg sm:text-xl text-[#4B3F2F]">All Sponsor Payments</CardTitle>
                                <p className="text-sm text-[#7A6C53] mt-1">{paymentsData?.meta?.total || 0} total payments</p>
                            </div>
                        </div>

                        {/* Right Side - All Filters in One Line */}
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full">
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

                            {/* Sponsor Type Dropdown */}
                            <Select value={selectedSponsorType} onValueChange={setSelectedSponsorType} disabled={showLoader}>
                                <SelectTrigger className="w-32 lg:w-40">
                                    <SelectValue placeholder="Sponsor Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Academic">Academic</SelectItem>
                                    <SelectItem value="Industry">Industry</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type Dropdown */}
                            <Select value={selectedType} onValueChange={setSelectedType} disabled={showLoader}>
                                <SelectTrigger className="w-24 lg:w-32">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bronze">Bronze</SelectItem>
                                    <SelectItem value="Silver">Silver</SelectItem>
                                    <SelectItem value="Gold">Gold</SelectItem>
                                    <SelectItem value="Diamond">Diamond</SelectItem>
                                </SelectContent>
                            </Select>

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
                            {(searchText || selectedType || selectedSponsorType || isCustomRangeApplied) && (
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

                    <CardContent className="pt-6 relative">
                        {showLoader && <Loader />}
                        {isError && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-md">
                                <p>Failed to load sponsor payments. Please try again later.</p>
                            </div>
                        )}

                        {paymentsData?.data?.length > 0 ? (
                            <div className="w-full overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-x-auto border border-[#EADFC8] rounded-xl">
                                        <table className="min-w-[1400px] w-full text-sm text-left table-fixed">
                                            <thead className="bg-[#FFEDED] text-[#800000]">
                                                <tr>
                                                    <th className="p-3 font-semibold text-center w-[150px]">Name</th>
                                                    <th className="p-3 font-semibold text-center w-[200px]">Email</th>
                                                    <th className="p-3 font-semibold text-center w-[120px]">Phone</th>
                                                    <th className="p-3 font-semibold text-center w-[100px]">Type</th>
                                                    <th className="p-3 font-semibold text-center w-[120px]">Sponsor Type</th>
                                                    <th className="p-3 font-semibold text-center w-[100px]">Amount</th>
                                                    <th className="p-3 font-semibold text-center w-[100px]">Status</th>
                                                    <th className="p-3 font-semibold text-center w-[120px]">Created Date</th>
                                                    <th className="p-3 font-semibold text-center w-[100px]">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paymentsData.data.map((item: any) => (
                                                    <tr key={item.payment._id} className="border-t border-[#EADFC8">
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
                                                        <td className="p-3 text-center text-[#4B3F2F] w-[100px] break-words">
                                                            <span className="text-xs font-medium">{item.payerDetails?.type}</span>
                                                        </td>
                                                        <td className="p-3 text-center text-[#4B3F2F] w-[120px] break-words">
                                                            <span className="text-xs">{item.payerDetails?.sponsorType}</span>
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

                                    {/* Pagination */}
                                    <div className="mt-6">
                                        {paymentsData?.meta?.totalPages > 1 && (
                                            <div className="flex justify-center">
                                                <ReactPaginate
                                                    previousLabel={"←"}
                                                    nextLabel={"→"}
                                                    breakLabel={"..."}
                                                    pageCount={paymentsData.meta.totalPages}
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
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="text-gray-500 text-center">
                                        <h3 className="text-lg font-medium mb-2">No sponsor payments found</h3>
                                        <p className="text-sm">There are no sponsor payments to display at the moment.</p>
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
                        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="bg-[#ffeeee] px-8 py-6 border-b border-[#A30000]/30 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#A30000] rounded-xl flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#A30000]">Sponsor Payment Details</h2>
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
                                        {/* Left Column - Sponsor Information */}
                                        <div className="space-y-6">
                                            {/* Sponsor Profile */}
                                            <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                                                <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                                                    <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                                                        <User className="w-4 h-4 text-[#A30000]" />
                                                        Sponsor Profile
                                                    </h3>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        {selectedPayment.payerDetails?.image ? (
                                                            <img
                                                                src={selectedPayment.payerDetails.image || "/placeholder.svg"}
                                                                alt="Sponsor"
                                                                className="w-16 h-16 rounded-lg border-2 border-[#A30000]/10"
                                                                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-lg bg-[#ffeeee] flex items-center justify-center border-2 border-[#A30000]/30">
                                                                <User className="w-6 h-6 text-[#A30000]" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-bold text-[#A30000] mb-1">
                                                                {selectedPayment.payerDetails?.firstName} {selectedPayment.payerDetails?.lastName}
                                                            </h4>
                                                            {selectedPayment.payerDetails?.companyName && (
                                                                <p className="text-gray-600 font-medium text-sm">
                                                                    {selectedPayment.payerDetails.companyName}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div className="flex gap-3 py-2 border-b border-[#A30000]/10">
                                                            <Mail className="w-4 h-4 text-[#A30000]" />
                                                            <div>
                                                                <div className="text-xs text-[#A30000] uppercase font-medium">Email</div>
                                                                <div className="text-sm text-gray-800">{selectedPayment.payerDetails?.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3 py-2 border-b border-[#A30000]/10">
                                                            <Phone className="w-4 h-4 text-[#A30000]" />
                                                            <div>
                                                                <div className="text-xs text-[#A30000] uppercase font-medium">Phone</div>
                                                                <div className="text-sm text-gray-800">{selectedPayment.payerDetails?.phone}</div>
                                                            </div>
                                                        </div>
                                                        {selectedPayment.payerDetails?.websiteUrl && (
                                                            <div className="flex gap-3 py-2 border-b border-[#A30000]/10">
                                                                <Globe className="w-4 h-4 text-[#A30000]" />
                                                                <div className="flex-1">
                                                                    <div className="text-xs text-[#A30000] uppercase font-medium">Website</div>
                                                                    <a
                                                                        href={
                                                                            selectedPayment.payerDetails.websiteUrl.startsWith("http")
                                                                                ? selectedPayment.payerDetails.websiteUrl
                                                                                : `https://${selectedPayment.payerDetails.websiteUrl}`
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-sm hover:underline break-all"
                                                                    >
                                                                        {selectedPayment.payerDetails.websiteUrl}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {selectedPayment.payerDetails?.companyDescription && (
                                                        <div className="mt-4 pt-3">
                                                            <div className="text-xs text-[#A30000] uppercase font-medium mb-2">
                                                                Company Description
                                                            </div>
                                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                                {selectedPayment.payerDetails.companyDescription}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Payment Details Table */}
                                        <div className="space-y-7">
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
                                                                        ${selectedPayment.payment?.amount?.toLocaleString()}
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
                                                                        <span className="text-xs font-medium">
                                                                            {selectedPayment.payment?.status?.toUpperCase()}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                                <tr className="hover:bg-[#ffeeee]">
                                                                    <td className="py-2 text-xs font-medium text-gray-600">Sponsorship Tier</td>
                                                                    <td className="py-2 text-xs font-semibold text-[#A30000]">
                                                                        {selectedPayment.payerDetails?.sponsorshipTier}
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
                                                                    <td className="py-2 text-xs font-medium text-gray-600">Sponsor Type</td>
                                                                    <td className="py-2 text-xs text-gray-800">
                                                                        {selectedPayment.payerDetails?.sponsorType}
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
                                        </div>
                                    </div>

                                    {/* Full Width Order Summary Table */}
                                    <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
                                        <div className="bg-[#ffeeee] px-6 py-4 border-b border-[#A30000]/30">
                                            <h3 className="text-lg font-semibold text-[#A30000] flex items-center gap-2">
                                                <ClipboardList className="w-5 h-5 text-[#A30000]" />
                                                Order Summary
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="overflow-x-auto rounded-md">
                                                <table className="w-full border-collapse min-w-[800px] border border-gray-100 ">
                                                    <thead>
                                                        <tr className=" bg-red-50">
                                                            <th className="text-left py-4 px-4 text-sm font-semibold text-[#A30000] uppercase tracking-wide border-r border-gray-200">
                                                                Item
                                                            </th>
                                                            <th className="text-left py-4 px-4 text-sm font-semibold text-[#A30000] uppercase tracking-wide border-r border-gray-200">
                                                                Description
                                                            </th>
                                                            <th className="text-center py-4 px-4 text-sm font-semibold text-[#A30000] uppercase tracking-wide border-r border-gray-200">
                                                                Cost
                                                            </th>
                                                            <th className="text-center py-4 px-4 text-sm font-semibold text-[#A30000] uppercase tracking-wide border-r border-gray-200">
                                                                Qty
                                                            </th>
                                                            <th className="text-right py-4 px-4 text-sm font-semibold text-[#A30000] uppercase tracking-wide">
                                                                Price
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {/* Registration Sessions */}
                                                        {selectedPayment.payerDetails?.registrationDetails?.selectedSessions?.map(
                                                            (session: any, index: number) => (
                                                                <tr key={`session-${index}`} className="border-b border-gray-100">
                                                                    <td className="py-4 px-4 border-r border-gray-100">
                                                                        <div className="font-medium text-gray-900">{session.Level} Sponsorship</div>
                                                                    </td>
                                                                    <td className="py-4 px-4 border-r border-gray-100">
                                                                        <div className="text-sm text-gray-700">
                                                                            <div className="mb-1 font-medium">{session.Booth}</div>
                                                                            <div className="text-xs text-gray-500 mb-1">{session.Extras}</div>
                                                                            <div className="text-xs text-gray-500 mb-1">{session.Registrations}</div>
                                                                            <div className="text-xs text-gray-500">{session.Recognition}</div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-4 text-center text-sm text-gray-900 border-r border-gray-100 font-medium">
                                                                        {session.Fee.includes(".") ? session.Fee : session.Fee + ".00"}
                                                                    </td>
                                                                    <td className="py-4 px-4 text-center text-sm text-gray-900 border-r border-gray-100 font-medium">
                                                                        1
                                                                    </td>
                                                                    <td className="py-4 px-4 text-right text-sm font-bold text-[#A30000]">
                                                                        {session.Fee.includes(".") ? session.Fee : session.Fee + ".00"}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}

                                                        {/* Award Sponsorships */}
                                                        {selectedPayment.payerDetails?.awardSponsorship?.map((award: any, index: number) => (
                                                            <tr key={`award-${index}`} className="border-b border-gray-100">
                                                                <td className="py-4 px-4 border-r border-gray-100">
                                                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                        <Award className="min-w-4 min-h-4 w-4 h-4 text-[#A30000] flex-shrink-0" />
                                                                        <span className="whitespace-normal break-words">{award.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-4 border-r border-gray-100">
                                                                    <div className="text-sm text-gray-700 font-medium">Award sponsorship program</div>
                                                                </td>
                                                                <td className="py-4 px-4 text-center text-sm text-gray-900 border-r border-gray-100 font-medium">
                                                                    ${Number.parseInt(award.unitPrice).toLocaleString()}.00
                                                                </td>
                                                                <td className="py-4 px-4 text-center text-sm text-gray-900 border-r border-gray-100 font-medium">
                                                                    {award.count}
                                                                </td>
                                                                <td className="py-4 px-4 text-right text-sm font-bold text-[#A30000]">
                                                                    ${Number.parseInt(award.amount).toLocaleString()}.00
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Summary Section */}
                                            <div className="mt-8 border-t-2 border-[#A30000]/10 pt-4">
                                                <div className="flex justify-end">
                                                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                                        <div className="flex justify-end gap-4 text-lg font-bold">
                                                            <span className="text-[#A30000]">Total:</span>
                                                            <span className="text-[#A30000]">
                                                                ${selectedPayment.payment?.amount?.toLocaleString()}.00
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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

export default SponsorPaymentsPage
