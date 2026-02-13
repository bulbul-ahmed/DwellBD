import { forwardRef } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, size = 'md', children, className = '' }, ref) => {
    if (!open) return null

    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
    }

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            ref={ref}
            className={`${sizeClasses[size]} flex max-h-[90vh] w-full transform flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all ${className}`}
          >
            {/* Header */}
            {(title || true) && (
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              {/* Footer buttons can be added here */}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export default Modal
