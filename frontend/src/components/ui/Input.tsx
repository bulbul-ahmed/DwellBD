import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: ReactNode
  iconEnd?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, iconEnd, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border px-3 py-2 transition-colors focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-transparent focus:ring-primary-500'
            } ${icon ? 'pl-10' : ''} ${iconEnd ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {iconEnd && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {iconEnd}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
