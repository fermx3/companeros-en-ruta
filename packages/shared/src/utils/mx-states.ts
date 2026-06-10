/**
 * Los 32 estados de México (31 estados + Ciudad de México).
 *
 * `name` se usa como valor almacenado en `clients.address_state` (texto) y como
 * label visible. El array está ordenado alfabéticamente para que los selectores
 * sean predecibles.
 *
 * Si en el futuro necesitamos un código ISO 3166-2 estandarizado para
 * integraciones (mapas, logística), agregamos `iso_code` aquí sin romper
 * consumidores existentes.
 */
export interface MxState {
  name: string
}

export const MX_STATES: readonly MxState[] = [
  { name: 'Aguascalientes' },
  { name: 'Baja California' },
  { name: 'Baja California Sur' },
  { name: 'Campeche' },
  { name: 'Chiapas' },
  { name: 'Chihuahua' },
  { name: 'Ciudad de México' },
  { name: 'Coahuila' },
  { name: 'Colima' },
  { name: 'Durango' },
  { name: 'Estado de México' },
  { name: 'Guanajuato' },
  { name: 'Guerrero' },
  { name: 'Hidalgo' },
  { name: 'Jalisco' },
  { name: 'Michoacán' },
  { name: 'Morelos' },
  { name: 'Nayarit' },
  { name: 'Nuevo León' },
  { name: 'Oaxaca' },
  { name: 'Puebla' },
  { name: 'Querétaro' },
  { name: 'Quintana Roo' },
  { name: 'San Luis Potosí' },
  { name: 'Sinaloa' },
  { name: 'Sonora' },
  { name: 'Tabasco' },
  { name: 'Tamaulipas' },
  { name: 'Tlaxcala' },
  { name: 'Veracruz' },
  { name: 'Yucatán' },
  { name: 'Zacatecas' },
] as const

/** Tuple of state names for zod enum + autocomplete. */
export const MX_STATE_NAMES = MX_STATES.map(s => s.name) as readonly string[]

/** Check if a candidate string matches a valid MX state name (case-sensitive). */
export function isValidMxState(value: string | null | undefined): boolean {
  if (!value) return false
  return MX_STATE_NAMES.includes(value)
}
