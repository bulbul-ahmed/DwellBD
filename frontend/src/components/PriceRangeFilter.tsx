import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import RangeSlider from './ui/RangeSlider'
import Input from './ui/Input'
import { cn } from '@/lib/utils'

interface PriceRangeFilterProps {
  minPrice?: number | string
  maxPrice?: number | string
  onChange: (minPrice?: number, maxPrice?: number) => void
  className?: string
  label?: string
  currency?: string
  step?: number
}

export default function PriceRangeFilter({
  minPrice = '',
  maxPrice = '',
  onChange,
  className,
  label = "Price Range",
  currency = 'BDT',
  step = 1000
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState<number>(minPrice as number || 0)
  const [localMax, setLocalMax] = useState<number>(maxPrice as number || 100000)
  const [tempMin, setTempMin] = useState<number>(minPrice as number || 0)
  const [tempMax, setTempMax] = useState<number>(maxPrice as number || 100000)
  const [showInputs, setShowInputs] = useState(false)

  // Update local values when props change
  useEffect(() => {
    setLocalMin(minPrice as number || 0)
    setLocalMax(maxPrice as number || 100000)
    setTempMin(minPrice as number || 0)
    setTempMax(maxPrice as number || 100000)
  }, [minPrice, maxPrice])

  const handleSliderChange = (values: [number, number]) => {
    const [newMin, newMax] = values
    setTempMin(newMin)
    setTempMax(newMax)
    onChange(newMin, newMax)
  }

  const handleInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0
    if (type === 'min') {
      const newMin = Math.min(numValue, tempMax - step)
      setTempMin(newMin)
      setLocalMin(newMin)
      onChange(newMin, tempMax)
    } else {
      const newMax = Math.max(numValue, tempMin + step)
      setTempMax(newMax)
      setLocalMax(newMax)
      onChange(tempMin, newMax)
    }
  }

  const clearRange = () => {
    setTempMin(0)
    setTempMax(100000)
    setLocalMin(0)
    setLocalMax(100000)
    onChange(undefined, undefined)
  }

  const hasActiveRange = tempMin > 0 || tempMax < 100000

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {hasActiveRange && (
          <button
            onClick={clearRange}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Range Slider */}
      <RangeSlider
        min={0}
        max={100000}
        value={[tempMin, tempMax]}
        onChange={handleSliderChange}
        currency={currency}
        step={step}
        showPresetRanges
      />

      {/* Toggle for detailed input */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowInputs(!showInputs)}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          {showInputs ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* Detailed Input Fields */}
      {showInputs && (
        <div className="space-y-3 rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Minimum {currency}</label>
              <Input
                type="number"
                min="0"
                step={step}
                value={localMin}
                onChange={(e) => handleInputChange('min', e.target.value)}
                placeholder="Min"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Maximum {currency}</label>
              <Input
                type="number"
                min="0"
                step={step}
                value={localMax}
                onChange={(e) => handleInputChange('max', e.target.value)}
                placeholder="Max"
                className="w-full"
              />
            </div>
          </div>

          {/* Validation message */}
          {localMin >= localMax && (
            <p className="text-xs text-red-600">
              Minimum price must be less than maximum price
            </p>
          )}
        </div>
      )}

      {/* Current Range Display */}
      {hasActiveRange && (
        <div className="rounded-md bg-primary-50 p-3 text-sm">
          <p className="text-primary-700 font-medium">
            Showing properties between{' '}
            <span className="font-bold">
              {new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 })
                .format(tempMin)}
            </span>{' '}
            and{' '}
            <span className="font-bold">
              {new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 })
                .format(tempMax)}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}