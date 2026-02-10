import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import RangeSlider from './ui/RangeSlider'
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
  const [tempMin, setTempMin] = useState<number>(minPrice as number || 0)
  const [tempMax, setTempMax] = useState<number>(maxPrice as number || 100000)

  // Update values when props change
  useEffect(() => {
    setTempMin(minPrice as number || 0)
    setTempMax(maxPrice as number || 100000)
  }, [minPrice, maxPrice])

  const handleSliderChange = (values: [number, number]) => {
    const [newMin, newMax] = values
    setTempMin(newMin)
    setTempMax(newMax)
    onChange(newMin, newMax)
  }

  const clearRange = () => {
    setTempMin(0)
    setTempMax(100000)
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

      {/* Current Range Display */}
      {hasActiveRange && (
        <div className="rounded-md bg-primary-50 px-3 py-2 text-sm">
          <p className="text-primary-700">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(tempMin)}
            {' '}-{' '}
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(tempMax)}
          </p>
        </div>
      )}
    </div>
  )
}