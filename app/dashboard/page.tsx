"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users, Calendar, X, Router } from "lucide-react"
import { Button } from "@/components/ui/button"
import RootLayout from "../RootLayout"
import { useGetDashboardCountQuery } from "@/lib/redux/features/post/postsApiSlice"
import Loader from "@/components/loading-screen"
import { useState } from "react"
import { DateRangePicker, type Range } from "react-date-range"
import { format } from "date-fns"
import "react-date-range/dist/styles.css" // main css file
import "react-date-range/dist/theme/default.css" // theme css file
import { useRouter } from "next/navigation"



export default function DashboardPage() {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isCustomRangeApplied, setIsCustomRangeApplied] = useState(false)
  const router = useRouter();
  const [filterLoading, setFilterLoading] = useState(false);
  // Initialize with undefined dates - no default date range
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

  const { startDate: appliedStartDate, endDate: appliedEndDate } = appliedDateRange[0]


  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0") // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Only prepare query parameters if both dates are selected
  // Only prepare query parameters if both dates are selected
  const queryParams =
    appliedStartDate && appliedEndDate && isCustomRangeApplied
      ? {
        startDate: formatDateForAPI(appliedStartDate), // Use the new helper function
        endDate: formatDateForAPI(appliedEndDate), // Use the new helper function
      }
      : undefined

  // Skip API call if no dates are applied
  const { data, isLoading, isError, refetch } = useGetDashboardCountQuery(queryParams)

  const counts = data?.data

  const handleDateChange = (item: any) => {
    setSelectedDateRange([item.selection])
  }

  const handleApply = async () => {
    const { startDate, endDate } = selectedDateRange[0]
    if (startDate && endDate) {
      setAppliedDateRange(selectedDateRange)
      setIsCustomRangeApplied(true)
      setShowDatePicker(false)
      setFilterLoading(true);
      try {
        await refetch();  // je API call che ene feri call karo
      } finally {
        setFilterLoading(false);
      }
    }
  }

  const handleCancel = () => {
    // Reset selected dates to applied dates and close picker
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

  // Show message when no date range is selected
  // const shouldShowNoDataMessage = !isCustomRangeApplied || !appliedStartDate || !appliedEndDate

  return (
    <RootLayout>
      <div className="space-y-4">
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

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Dashboard</h1>
            <p className="text-muted-foreground text-[#7A6C53] mt-1">Welcome to your admin dashboard</p>
          </div>

          {/* Date Range Picker Section */}
          <div className="mt-4 lg:mt-0 relative">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 bg-[#FFF9F0] border-[#E5D5B7] hover:bg-[#FFFFFF] text-gray-900"
              >
                <Calendar className="h-4 w-4" />
                {getDateRangeText()}
              </Button>
              {isCustomRangeApplied && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDates}
                  className="h-10 w-10 p-0 hover:bg-[#FFF9F0] border border-[#E5D5B7] hover:border-[#D4C4A8]"
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
                    onClick={handleCancel}
                    className="border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    className="bg-customButton-text hover:bg-[#800000] rounded-md transition-colors"
                    disabled={!selectedDateRange[0].startDate || !selectedDateRange[0].endDate}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Loader */}

        {/* Error Message */}
        {isError && (
          <div className="text-red-700 px-4 py-3 rounded relative mx-3 bg-red-50 border border-red-200">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">Failed to fetch dashboard data. Please try again later.</span>
          </div>
        )}

        {/* Dashboard Cards */}
        {(isLoading || filterLoading) ? (
          <Loader />
        ) : !isError && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 px-3 pb-6">

            {/* Attendee Count */}
            <Card onClick={() => router.push("/attendee")} className="cursor-pointer border bg-[#FFF9F0] border-[#E5D5B7] hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">Attendees</CardTitle>
                <Users className="h-4 w-4 text-gray-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{counts?.attendeeCount ?? 0}</div>
                <p className="text-xs text-gray-900 mt-0.5">
                  {isCustomRangeApplied && appliedStartDate && appliedEndDate
                    ? "Attendees in selected period"
                    : "Total attendees registered"}
                </p>
              </CardContent>
            </Card>

            {/* Admin Count */}
            <Card onClick={() => router.push("/users")} className="cursor-pointer border bg-[#FFF9F0] border-[#E5D5B7] hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">Admins</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{counts?.adminCount ?? 0}</div>
                <p className="text-xs text-gray-900 mt-0.5">
                  {isCustomRangeApplied && appliedStartDate && appliedEndDate
                    ? "Admins in selected period"
                    : "Total admins registered"}
                </p>
              </CardContent>
            </Card>

            {/* Sub Admin Count */}
            <Card onClick={() => router.push("/users")} className="cursor-pointer border bg-[#FFF9F0] border-[#E5D5B7] hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">Sub Admins</CardTitle>
                <CreditCard className="h-4 w-4 text-gray-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{counts?.subAdminCount ?? 0}</div>
                <p className="text-xs text-gray-900 mt-0.5">
                  {isCustomRangeApplied && appliedStartDate && appliedEndDate
                    ? "Sub admins in selected period"
                    : "Total sub admins registered"}
                </p>
              </CardContent>
            </Card>

            {/* Manager Count */}
            <Card onClick={() => router.push("/users")} className="cursor-pointer border bg-[#FFF9F0] border-[#E5D5B7] hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">Managers</CardTitle>
                <Activity className="h-4 w-4 text-gray-900" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{counts?.managerCount ?? 0}</div>
                <p className="text-xs text-gray-900 mt-0.5">
                  {isCustomRangeApplied && appliedStartDate && appliedEndDate
                    ? "Managers in selected period"
                    : "Total managers registered"}
                </p>
              </CardContent>
            </Card>

          </div>
        )}

      </div>
    </RootLayout>
  )
}
