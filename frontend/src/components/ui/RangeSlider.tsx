import { useState, useEffect, useRef, forwardRef, HTMLAttributes } from 'react'

interface RangeSliderProps extends HTMLAttributes<HTMLDivElement> {
  min: number
  max: number
  value: [number, number]
  onChange: (values: [number, number]) => void
  step?: number
  currency?: string
  className?: string
  disabled?: boolean
  showLabels?: boolean
  showPresetRanges?: boolean
  presetRanges?: Array<[number, number]>
}

const defaultPresetRanges: Array<[number, number]> = [
  [0, 10000],
  [10000, 25000],
  [25000, 50000],
  [50000, 100000],
  [100000, 200000]
]

export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  ({
    min,
    max,
    value: [currentMin, currentMax],
    onChange,
    step = 1000,
    currency = 'BDT',
    className = '',
    disabled = false,
    showLabels = true,
    showPresetRanges = true,
    presetRanges = defaultPresetRanges,
    ...props
  }, ref) => {
    const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
    const [tempValues, setTempValues] = useState<[number, number]>([currentMin, currentMax])
    const sliderRef = useRef<HTMLDivElement>(null)

    // Update temp values when current values change
    useEffect(() => {
      setTempValues([currentMin, currentMax])
    }, [currentMin, currentMax])

    const handleMouseDown = (thumb: 'min' | 'max', e: React.MouseEvent) => {
      if (disabled) return
      e.preventDefault()
      setDragging(thumb)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !sliderRef.current || disabled) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newValue = min + percent * (max - min)

      if (dragging === 'min') {
        const newMin = Math.max(min, Math.min(newValue - step, currentMax - step))
        setTempValues([Math.round(newMin / step) * step, currentMax])
      } else {
        const newMax = Math.min(max, Math.max(newValue + step, currentMin + step))
        setTempValues([currentMin, Math.round(newMax / step) * step])
      }
    }

    const handleMouseUp = () => {
      if (dragging) {
        onChange(tempValues)
        setDragging(null)
      }
    }

    // Handle mouse events
    useEffect(() => {
      if (dragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [dragging])

    const handlePresetRange = (preset: [number, number]) => {
      onChange(preset)
    }

    const getPercent = (value: number) => ((value - min) / (max - min)) * 100

    const minPercent = getPercent(tempValues[0])
    const maxPercent = getPercent(tempValues[1])
    const rangeWidth = maxPercent - minPercent

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('bn-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 0
      }).format(value)
    }

    return (
      <div className={`space-y-4 ${className}`} ref={ref} {...props}>
        {/* Range Slider */}
        <div className="relative">
          <div
            ref={sliderRef}
            className="relative h-2 w-full cursor-pointer rounded-full bg-gray-200 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${minPercent}%, #d1d5db ${minPercent}%, #d1d5db ${maxPercent}%, #ef4444 ${maxPercent}%, #ef4444 100%)` }}
          >
            {/* Min handle */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing ${
                disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              }`}
              style={{ left: `${minPercent}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={(e) => handleMouseDown('min', e)}
            />

            {/* Max handle */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing ${
                disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              }`}
              style={{ left: `${maxPercent}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={(e) => handleMouseDown('max', e)}
            />
          </div>
        </div>

        {/* Value Labels */}
        {showLabels && (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">
              {formatCurrency(tempValues[0])}
            </span>
            <span className="font-medium text-gray-700">
              {formatCurrency(tempValues[1])}
            </span>
          </div>
        )}

        {/* Preset Ranges */}
        {showPresetRanges && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Quick Ranges</p>
            <div className="flex flex-wrap gap-2">
              {presetRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetRange(range)}
                  disabled={disabled}
                  className={`rounded-md px-3 py-1 text-xs transition-colors ${
                    tempValues[0] === range[0] && tempValues[1] === range[1]
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {formatCurrency(range[0])} - {formatCurrency(range[1])}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Fields for precise control */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Min</label>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={tempValues[0]}
              onChange={(e) => {
                const newMin = Math.max(min, Math.min(Number(e.target.value), currentMax - step))
                setTempValues([Math.round(newMin / step) * step, currentMax])
              }}
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Max</label>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={tempValues[1]}
              onChange={(e) => {
                const newMax = Math.min(max, Math.max(Number(e.target.value), currentMin + step))
                setTempValues([currentMin, Math.round(newMax / step) * step])
              }}
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>
    )
  }
)

RangeSlider.displayName = 'RangeSlider'

export default RangeSlider