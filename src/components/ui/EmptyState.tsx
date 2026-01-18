'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ===========================================
// Types
// ===========================================

interface EmptyStateProps {
  /** Ícono a mostrar (SVG como string o componente) */
  icon?: React.ReactNode
  /** Título del estado vacío */
  title: string
  /** Descripción opcional */
  description?: string
  /** Texto del botón de acción */
  actionText?: string
  /** Handler del botón de acción */
  onAction?: () => void
  /** Clases adicionales */
  className?: string
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg'
}

// ===========================================
// Component
// ===========================================

/**
 * Componente de estado vacío reutilizable.
 * Usado para mostrar cuando no hay datos o resultados.
 *
 * @example
 * <EmptyState
 *   title="No hay visitas"
 *   description="Aún no tienes visitas programadas"
 *   actionText="Crear nueva visita"
 *   onAction={handleCreateVisit}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  // ===========================================
  // Utility Functions
  // ===========================================

  /**
   * Obtener clases de tamaño
   */
  const getSizeClasses = () => {
    const sizes = {
      sm: 'py-6',
      md: 'py-12',
      lg: 'py-16'
    }
    return sizes[size]
  }

  /**
   * Obtener tamaño de ícono por defecto
   */
  const getIconSize = () => {
    const iconSizes = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20'
    }
    return iconSizes[size]
  }

  /**
   * Ícono por defecto si no se proporciona uno
   */
  const defaultIcon = (
    <svg
      className={cn('text-gray-400 mx-auto mb-4', getIconSize())}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  )

  // ===========================================
  // Main Render
  // ===========================================

  return (
    <div className={cn('text-center', getSizeClasses(), className)}>
      {/* Icon */}
      {icon || defaultIcon}

      {/* Title */}
      <h3 className={cn(
        'font-semibold text-gray-900 mb-2',
        size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn(
          'text-gray-500 mb-6',
          size === 'sm' ? 'text-sm' : 'text-base'
        )}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}

// ===========================================
// Predefined Empty States
// ===========================================

/**
 * Estado vacío para visitas
 */
const VisitsEmptyState = (props: Omit<EmptyStateProps, 'icon' | 'title'>) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    }
    title="No hay visitas"
    {...props}
  />
)
VisitsEmptyState.displayName = 'EmptyState.Visits'

/**
 * Estado vacío para clientes
 */
const ClientsEmptyState = (props: Omit<EmptyStateProps, 'icon' | 'title'>) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0z" />
      </svg>
    }
    title="No hay clientes"
    {...props}
  />
)
ClientsEmptyState.displayName = 'EmptyState.Clients'

/**
 * Estado de error genérico
 */
const ErrorEmptyState = (props: Omit<EmptyStateProps, 'icon' | 'title'>) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Algo salió mal"
    {...props}
  />
)
ErrorEmptyState.displayName = 'EmptyState.Error'

// Asignar como propiedades estáticas
EmptyState.Visits = VisitsEmptyState
EmptyState.Clients = ClientsEmptyState
EmptyState.Error = ErrorEmptyState
