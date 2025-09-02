import type { SerializedError } from "@reduxjs/toolkit"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"

// Helper to handle API errors
export const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === "object" && error != null && "status" in error
}

export const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return typeof error === "object" && error != null && "message" in error && typeof (error as any).message === "string"
}

// Extract error message from different error types
export const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return "Unknown error occurred"

  // Handle FetchBaseQueryError
  if (isFetchBaseQueryError(error)) {
    const errMsg = "error" in error ? error.error : JSON.stringify(error.data)
    return errMsg
  }

  // Handle SerializedError
  if (isErrorWithMessage(error)) {
    return error.message
  }

  return "Unknown error occurred"
}
