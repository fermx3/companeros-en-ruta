/**
 * Labels and helpers for displaying onboarding data in staff detail pages.
 */

export const GENDER_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiere no decir',
}

export const EMPLOYEES_LABELS: Record<string, string> = {
  solo_yo: 'Solo yo',
  '1_a_2': '1 a 2',
  '3_a_5': '3 a 5',
  '6_o_mas': '6 o más',
}

export const SUPPLY_SOURCE_LABELS: Record<string, string> = {
  distribuidor: 'Distribuidor',
  central_abastos: 'Central de abastos',
  mayorista: 'Mayorista',
  directo_fabricante: 'Directo del fabricante',
  otro: 'Otro',
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return 'No especificado'
  return value ? 'Sí' : 'No'
}

export function formatOnboardingDate(value: string | null | undefined): string {
  if (!value) return 'No especificado'
  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
