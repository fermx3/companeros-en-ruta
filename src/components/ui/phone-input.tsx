'use client'

import { useCallback } from 'react'
import { extractDigits, formatMxPhone } from '@/lib/utils/phone'

interface PhoneInputProps {
  value: string
  onChange: (digits: string) => void
  label?: string
  placeholder?: string
  error?: string
  id?: string
  disabled?: boolean
}

/**
 * Controlled phone input for Mexican 10-digit numbers.
 * Displays +52 prefix (visual only), auto-formats as (55) 1234-5678,
 * and shows digit counter. onChange returns clean digits only.
 */
export function PhoneInput({
  value,
  onChange,
  label,
  placeholder = '55 1234 5678',
  error,
  id,
  disabled = false,
}: PhoneInputProps) {
  const digits = extractDigits(value).slice(0, 10)
  const display = formatMxPhone(digits)

  const hasError = error || (digits.length > 0 && digits.length !== 10)
  const errorMessage = error || (digits.length > 0 && digits.length !== 10 ? 'Debe tener 10 dígitos' : undefined)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      const newDigits = extractDigits(raw).slice(0, 10)
      onChange(newDigits)
    },
    [onChange]
  )

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          +52
        </span>
        <input
          type="tel"
          id={id}
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 min-w-0 px-3 py-2 border rounded-r-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200 ${
            hasError
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          } ${disabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'bg-white'}`}
        />
      </div>
      <div className="flex justify-between mt-1">
        {errorMessage ? (
          <p className="text-xs text-red-500">{errorMessage}</p>
        ) : (
          <span />
        )}
        <span className={`text-xs ${digits.length === 10 ? 'text-green-600' : 'text-gray-400'}`}>
          {digits.length}/10
        </span>
      </div>
    </div>
  )
}
