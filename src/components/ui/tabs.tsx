/**
 * Tabs Component
 *
 * A reusable tabs component following Shadcn/ui patterns.
 * Supports controlled state with value and onValueChange props.
 *
 * @example
 * ```tsx
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="activos">
 *       Activos <span className="ml-1">(3)</span>
 *     </TabsTrigger>
 *     <TabsTrigger value="usados">Usados</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="activos">Content for activos</TabsContent>
 *   <TabsContent value="usados">Content for usados</TabsContent>
 * </Tabs>
 * ```
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TabsProps {
  /** Current active tab value */
  value: string
  /** Callback when tab changes */
  onValueChange: (value: string) => void
  /** Tab elements */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            currentValue: value,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

export interface TabsListProps {
  /** Tab trigger buttons */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Internal: current value from parent Tabs */
  value?: string
  /** Internal: callback from parent Tabs */
  onValueChange?: (value: string) => void
}

export function TabsList({ children, className, value, onValueChange }: TabsListProps) {
  return (
    <div className={cn('flex gap-3 p-1 bg-muted/30 rounded-xl', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            currentValue: value,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

export interface TabsTriggerProps {
  /** Value that identifies this tab */
  value: string
  /** Tab label content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

interface TabsTriggerInternalProps extends TabsTriggerProps {
  /** Internal: current value from parent Tabs */
  currentValue?: string
  /** Internal: callback from parent Tabs */
  onValueChange?: (value: string) => void
}

export function TabsTrigger({
  value: triggerValue,
  children,
  className,
  currentValue,
  onValueChange,
}: TabsTriggerInternalProps) {
  const isActive = currentValue === triggerValue

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange?.(triggerValue)}
      className={cn(
        'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        className
      )}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  /** Value that identifies this tab panel */
  value: string
  /** Panel content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

interface TabsContentInternalProps extends TabsContentProps {
  /** Internal: current value from parent Tabs */
  currentValue?: string
}

export function TabsContent({
  value: panelValue,
  children,
  className,
  currentValue,
}: TabsContentInternalProps) {
  const isActive = currentValue === panelValue

  if (!isActive) return null

  return (
    <div role="tabpanel" className={cn('mt-6', className)}>
      {children}
    </div>
  )
}
