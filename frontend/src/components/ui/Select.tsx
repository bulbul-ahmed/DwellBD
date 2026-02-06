import { forwardRef, SelectHTMLAttributes, ChangeEvent } from 'react'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
  onChange?: (value: string) => void
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', onChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className="w-full">
        {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
        <select
          ref={ref}
          className={`w-full rounded-lg border px-3 py-2 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-transparent focus:ring-primary-500'
          } ${className} `}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
