import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

interface PasswordRequirement {
  label: string
  met: boolean
  regex?: RegExp
  minLength?: number
}

export default function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const requirements = useMemo(() => {
    const reqs: PasswordRequirement[] = [
      {
        label: 'At least 8 characters',
        met: password.length >= 8,
        minLength: 8
      },
      {
        label: 'Contains uppercase letter (A-Z)',
        met: /[A-Z]/.test(password),
        regex: /[A-Z]/
      },
      {
        label: 'Contains lowercase letter (a-z)',
        met: /[a-z]/.test(password),
        regex: /[a-z]/
      },
      {
        label: 'Contains number (0-9)',
        met: /\d/.test(password),
        regex: /\d/
      },
      {
        label: 'Contains special character (!@#$%^&*)',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        regex: /[!@#$%^&*(),.?":{}|<>]/
      }
    ]
    return reqs
  }, [password])

  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: 'gray' }

    const metCount = requirements.filter(r => r.met).length
    const hasLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)

    // Minimum requirements (backend validation)
    const meetsMinimum = hasLength && hasUpper && hasLower && hasNumber

    if (metCount === 5) {
      return { level: 4, label: 'Very Strong', color: 'green' }
    } else if (metCount === 4 && meetsMinimum) {
      return { level: 3, label: 'Strong', color: 'green' }
    } else if (metCount === 4 || (metCount === 3 && meetsMinimum)) {
      return { level: 2, label: 'Fair', color: 'yellow' }
    } else if (password.length > 0) {
      return { level: 1, label: 'Weak', color: 'red' }
    }

    return { level: 0, label: '', color: 'gray' }
  }, [password, requirements])

  const getStrengthBarColor = (index: number) => {
    if (index >= strength.level) return 'bg-gray-200'

    switch (strength.color) {
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'red':
        return 'bg-red-500'
      default:
        return 'bg-gray-200'
    }
  }

  const getStrengthTextColor = () => {
    switch (strength.color) {
      case 'green':
        return 'text-green-600'
      case 'yellow':
        return 'text-yellow-600'
      case 'red':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  if (!password) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                getStrengthBarColor(index)
              )}
            />
          ))}
        </div>
        {strength.label && (
          <p className={cn('text-sm font-medium', getStrengthTextColor())}>
            Password Strength: {strength.label}
          </p>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-700">Password must contain:</p>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            )}
            <span className={cn(
              'transition-colors',
              req.met ? 'text-green-700 font-medium' : 'text-gray-600'
            )}>
              {req.label}
              {index === 4 && ' (optional but recommended)'}
            </span>
          </div>
        ))}
      </div>

      {/* Helpful Tips */}
      {password.length > 0 && strength.level < 3 && (
        <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">💡 Tips for a stronger password:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {!requirements[0].met && <li>Use at least 8 characters</li>}
            {!requirements[4].met && <li>Add special characters for extra security</li>}
            <li>Avoid common words or patterns</li>
            <li>Don't use personal information</li>
          </ul>
        </div>
      )}

      {/* Success Message */}
      {strength.level >= 3 && (
        <div className="rounded-md bg-green-50 p-3 text-xs text-green-700 flex items-center gap-2">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">Great! Your password is {strength.label.toLowerCase()}.</span>
        </div>
      )}
    </div>
  )
}
