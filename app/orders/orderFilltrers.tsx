"use client"

import React, { useState } from "react"
import { Search, Calendar, Download, X } from "lucide-react"
import { OrderFilters as OrderFiltersType } from "@/types/order"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { DateRangePicker, type Range } from "react-date-range"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"

interface OrderFiltersProps {
  filters: OrderFiltersType
  onFiltersChange: (filters: OrderFiltersType) => void
  onExport: () => void
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ filters, onFiltersChange, onExport }) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isCustomRangeApplied, setIsCustomRangeApplied] = useState(false)
  
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

  const updateFilter = (key: keyof OrderFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleDateChange = (item: any) => {
    setSelectedDateRange([item.selection])
  }

  const handleApply = () => {
    const { startDate, endDate } = selectedDateRange[0]
    if (startDate && endDate) {
      setAppliedDateRange(selectedDateRange)
      setIsCustomRangeApplied(true)
      setShowDatePicker(false)
      // Update filters with date range
      updateFilter("dateFrom", format(startDate, "yyyy-MM-dd"))
      updateFilter("dateTo", format(endDate, "yyyy-MM-dd"))
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
    // Clear date filters
    updateFilter("dateFrom", "")
    updateFilter("dateTo", "")
  }

  const getDateRangeText = () => {
    const start = appliedDateRange[0].startDate
    const end = appliedDateRange[0].endDate
    if (start && end && isCustomRangeApplied) {
      return `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`
    }
    return "Select Date Range"
  }

  return (
    <Card className="border-0 shadow-lg bg-transparent">
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

      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Left side: Search and Status */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Order Status - Using shadcn Select */}
            <div className="w-full sm:w-48">
              <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}>
                <SelectTrigger className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Right side: Date Picker and Export */}
          <div className="flex items-center gap-2">
            {/* Date Range Picker Button */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 bg-[#FFF9F0] border-[#E5D5B7] hover:bg-[#FFFFFF] text-gray-900"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{getDateRangeText()}</span>
                <span className="sm:hidden">Dates</span>
              </Button>
              
              {isCustomRangeApplied && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDates}
                  className="h-10 w-10 p-0 hover:bg-[#FFF9F0] border border-[#E5D5B7] hover:border-[#D4C4A8] ml-2"
                >
                  <X className="h-4 w-4 text-[#8B7355] hover:text-[#7A6C53]" />
                </Button>
              )}
              
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
            
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderFilters