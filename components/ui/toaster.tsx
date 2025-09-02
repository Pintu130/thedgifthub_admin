"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={4000}>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        // Define dynamic colors based on variant
        const isError = variant === "destructive"
        const borderColor = isError ? "border-red-500" : "border-green-500"
        const titleColor = isError ? "text-red-600" : "text-green-600"

        return (
          <Toast
            key={id}
            {...props}
            className={`group border-l-4 bg-white shadow-lg ${borderColor}`}
          >
            <div className="grid gap-1">
              {title && <ToastTitle className={`font-medium ${titleColor}`}>{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-gray-600">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
