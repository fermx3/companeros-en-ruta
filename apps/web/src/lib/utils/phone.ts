import { z } from 'zod'

/** Strip everything except digits */
export function extractDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Format 10 digits as (55) 1234-5678 */
export function formatMxPhone(digits: string): string {
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`
}

/** Handle input: extract digits, cap at 10, format */
export function handlePhoneChange(raw: string): { display: string; digits: string } {
  const digits = extractDigits(raw).slice(0, 10)
  return { display: formatMxPhone(digits), digits }
}

/** Validate: empty is ok, otherwise exactly 10 digits */
export function isValidMxPhone(value: string | null | undefined): boolean {
  if (!value) return true
  return extractDigits(value).length === 10
}

/** Format a stored phone value for read-only display: +52 (55) 1234-5678 */
export function displayPhone(value: string | null | undefined): string {
  if (!value) return ''
  const digits = extractDigits(value)
  if (digits.length === 0) return ''
  return `+52 ${formatMxPhone(digits)}`
}

/** Zod refinement for API routes — accepts optional/nullable string, validates 10 digits if present */
export const mxPhoneSchema = z.string().optional().nullable()
  .transform(val => {
    if (!val) return val
    return extractDigits(val)
  })
  .refine(val => !val || val.length === 10, {
    message: 'El teléfono debe tener 10 dígitos'
  })
