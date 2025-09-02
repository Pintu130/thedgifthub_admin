"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import React from "react"
import { Command, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command" // Import Command components
import { X, Loader2, Search } from "lucide-react" // Import X icon and Loader2 for search loading
import { Button } from "@/components/ui/button" // Import Button for clear icon

interface FormSelectOption {
    value: string
    label: string
    // Allow for additional properties for custom rendering, e.g., image
    [key: string]: any
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: FormSelectOption[]
    error?: string
    placeholder?: string
    // New prop to allow custom rendering of SelectItem content
    renderOption?: (option: FormSelectOption) => React.ReactNode
    // Props for searchable functionality
    searchable?: boolean
    searchValue?: string
    onSearchChange?: (value: string) => void
    onClearSearch?: () => void
    isLoadingOptions?: boolean // To show loading state in dropdown
    emptyMessage?: string // Message for CommandEmpty
    searchPlaceholder?: string // Placeholder for search input
}

const FormSelectSearch = React.forwardRef<HTMLSelectElement, FormSelectProps>(
    (
        {
            label,
            options,
            error,
            placeholder,
            id,
            className,
            renderOption,
            searchable,
            searchValue,
            onSearchChange,
            onClearSearch,
            isLoadingOptions,
            emptyMessage,
            searchPlaceholder,
            ...props
        },
        ref,
    ) => {
        const selectId = id || props.name

        return (
            <div className={cn("space-y-1", className)}>
                <Label htmlFor={selectId} className="text-sm font-medium text-gray-700 flex items-center">
                    {label} {props.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Select
                    onValueChange={(value) => {
                        // Simulate onChange for native select element
                        const event = {
                            target: {
                                name: props.name,
                                value: value,
                            },
                        } as React.ChangeEvent<HTMLSelectElement>
                        props.onChange?.(event)
                    }}
                    value={props.value as string}
                    disabled={props.disabled}
                >
                    <SelectTrigger id={selectId} className={cn(error && "border-red-500")}>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {searchable ? (
                            <Command>
                                <div
                                    className="relative w-full border-b px-4 py-2 flex items-center gap-2 cursor-text"
                                    onClick={() => {
                                        const input = document.getElementById("command-search-input")
                                        input?.focus()
                                    }}
                                >
                                    {/* Search Icon */}
                                    <Search className="h-4 w-4 text-gray-400 shrink-0" />

                                    {/* Input Field */}
                                    <input
                                        id="command-search-input"
                                        type="text"
                                        placeholder={searchPlaceholder || "Search..."}
                                        value={searchValue}
                                        onChange={(e) => onSearchChange?.(e.target.value)}
                                        className="w-full bg-transparent text-sm focus:outline-none focus:ring-0 border-none outline-none"
                                    />

                                    {/* Clear Button */}
                                    {searchValue && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onClearSearch?.()
                                            }}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                                        >
                                            <X className="h-4 w-4 text-gray-500" />
                                        </button>
                                    )}
                                </div>


                                <CommandList className="max-h-60 overflow-y-auto">
                                    {isLoadingOptions ? (
                                        <CommandEmpty className="py-6 text-center text-sm">
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                                            Loading...
                                        </CommandEmpty>
                                    ) : options.length === 0 ? (
                                        <CommandEmpty className="py-6 text-center text-sm">
                                            {emptyMessage || "No results found."}
                                        </CommandEmpty>
                                    ) : (
                                        options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {renderOption ? renderOption(option) : option.label}
                                            </SelectItem>
                                        ))
                                    )}
                                </CommandList>
                            </Command>
                        ) : (
                            options.map((option: any) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {renderOption ? renderOption(option) : option.label}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        )
    },
)
FormSelectSearch.displayName = "FormSelect"

export default FormSelectSearch
