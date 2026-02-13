/**
 * UI Types - Compañeros en Ruta
 * Tipos compartidos para componentes del design system
 */

export type UserRole = 
  | 'admin' 
  | 'brand' 
  | 'supervisor' 
  | 'promotor' 
  | 'asesor_de_ventas' 
  | 'market_analyst' 
  | 'client'

export type StatusType = 
  | 'active' 
  | 'pending' 
  | 'completed' 
  | 'cancelled' 
  | 'expired'

export type TrendType = 
  | 'up' 
  | 'down' 
  | 'neutral'

export type VariantType = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'warning'

export type SizeType = 
  | 'sm' 
  | 'md' 
  | 'lg'

export type RequestType = 
  | 'campaign' 
  | 'promotion' 
  | 'visit'
