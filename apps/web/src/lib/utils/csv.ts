/**
 * Shared CSV utility for generating downloadable CSV files.
 * UTF-8 BOM included for proper Excel/Google Sheets compatibility with Spanish characters.
 */

const UTF8_BOM = '\uFEFF'

/**
 * Escape a value for safe CSV inclusion.
 * Handles commas, quotes, newlines, and null/undefined.
 */
export function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Build a complete CSV string from headers and rows.
 * Includes UTF-8 BOM for Excel compatibility.
 */
export function buildCsvString(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvValue).join(',')
  const dataLines = rows.map(row => row.map(escapeCsvValue).join(','))
  return UTF8_BOM + [headerLine, ...dataLines].join('\n')
}

/**
 * Create a Response object for CSV file download.
 */
export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  })
}

/**
 * Format a date string for CSV display in Spanish (Mexico) format.
 */
export function formatCsvDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', '')
  } catch {
    return dateStr
  }
}

/**
 * Format a date-only string (no time) for CSV display.
 */
export function formatCsvDateOnly(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/**
 * Format currency amount for CSV.
 */
export function formatCsvCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00'
  return `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
