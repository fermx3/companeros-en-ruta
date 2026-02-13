/**
 * Toast Components
 *
 * Toast notification system for displaying temporary messages.
 *
 * @example
 * ```tsx
 * import { useToast } from "./use-toast"
 *
 * function MyComponent() {
 *   const { toast } = useToast()
 *
 *   return (
 *     <Button onClick={() => toast({ title: "Success!", description: "Action completed" })}>
 *       Show Toast
 *     </Button>
 *   )
 * }
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning"
  title?: string
  description?: string
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", title, description, onClose, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white border-gray-200",
      success: "bg-green-50 border-green-200",
      error: "bg-red-50 border-red-200",
      warning: "bg-yellow-50 border-yellow-200",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg",
          "transition-all duration-300",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <div className="flex-1">
            {title && (
              <div className="text-sm font-semibold mb-1">{title}</div>
            )}
            {description && (
              <div className="text-sm text-gray-600">{description}</div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }
)

Toast.displayName = "Toast"

export { Toast }
