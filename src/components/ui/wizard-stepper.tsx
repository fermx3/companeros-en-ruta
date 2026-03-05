'use client'

import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  label: string
  shortLabel?: string
  icon?: React.ReactNode
}

export interface WizardStepperProps {
  steps: WizardStep[]
  currentStep: number
  completedSteps?: Set<number>
  warningSteps?: Set<number>
  savingStep?: number | null
  onStepClick?: (stepIndex: number) => void
  /** Force a specific layout, bypassing responsive breakpoints */
  layout?: 'desktop' | 'mobile'
  className?: string
}

export function WizardStepper({
  steps,
  currentStep,
  completedSteps,
  warningSteps,
  savingStep,
  onStepClick,
  layout,
  className,
}: WizardStepperProps) {
  const isCompleted = (index: number) =>
    completedSteps ? completedSteps.has(index) : index < currentStep

  const hasWarning = (index: number) => warningSteps?.has(index) ?? false

  const isSaving = (index: number) => savingStep === index

  const isClickable = (index: number) =>
    !!onStepClick && (isCompleted(index) || index <= currentStep)

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop view */}
      <div className={layout === 'mobile' ? 'hidden' : layout === 'desktop' ? 'block' : 'hidden sm:block'}>
        <nav aria-label="Progress">
          <ol className="flex items-start justify-center">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-start flex-1 last:flex-none">
                {/* Step button */}
                <button
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  disabled={!isClickable(index)}
                  className={cn(
                    'relative flex flex-col items-center justify-start group flex-shrink-0',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg p-2',
                    isClickable(index) && 'cursor-pointer',
                    !isClickable(index) && 'cursor-default'
                  )}
                >
                  {/* Circle indicator */}
                  <span
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                      isCompleted(index) && !hasWarning(index) && 'bg-blue-600 border-blue-600',
                      isCompleted(index) && hasWarning(index) && 'bg-red-500 border-red-500',
                      currentStep === index && !isCompleted(index) && 'border-blue-600 bg-white',
                      currentStep !== index && !isCompleted(index) && 'border-gray-300 bg-white'
                    )}
                  >
                    {isSaving(index) ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : isCompleted(index) && hasWarning(index) ? (
                      <AlertCircle className="w-5 h-5 text-white" />
                    ) : isCompleted(index) ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : step.icon ? (
                      <span
                        className={cn(
                          '[&>svg]:w-4 [&>svg]:h-4',
                          currentStep === index ? 'text-blue-600' : 'text-gray-500'
                        )}
                      >
                        {step.icon}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-medium',
                          currentStep === index ? 'text-blue-600' : 'text-gray-500'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </span>

                  {/* Label — max-w forces multi-word labels to wrap into 2 lines */}
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium text-center max-w-[5.5rem] leading-tight',
                      currentStep === index ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mt-[1.25rem] mx-1',
                      isCompleted(index) ? 'bg-blue-600' : 'bg-gray-200'
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Mobile view — circles + connectors, no labels (the bar below shows the name) */}
      <div className={layout === 'desktop' ? 'hidden' : layout === 'mobile' ? 'block' : 'sm:hidden'}>
        <div className="flex items-center px-6 py-3 bg-white border-b">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!isClickable(index)}
                className="flex-shrink-0 focus:outline-none"
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                    isCompleted(index) && !hasWarning(index) && 'bg-blue-600 border-blue-600',
                    isCompleted(index) && hasWarning(index) && 'bg-red-500 border-red-500',
                    currentStep === index && !isCompleted(index) && 'border-blue-600 bg-white',
                    currentStep !== index && !isCompleted(index) && 'border-gray-300 bg-white'
                  )}
                >
                  {isSaving(index) ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : isCompleted(index) && hasWarning(index) ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : isCompleted(index) ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : step.icon ? (
                    <span
                      className={cn(
                        '[&>svg]:w-4 [&>svg]:h-4',
                        currentStep === index ? 'text-blue-600' : 'text-gray-500'
                      )}
                    >
                      {step.icon}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        currentStep === index ? 'text-blue-600' : 'text-gray-500'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    isCompleted(index) ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step indicator */}
        <div className="px-4 py-2 bg-blue-50 border-b">
          <p className="text-sm text-blue-700 font-medium">
            Paso {currentStep + 1}: {steps[currentStep]?.label}
          </p>
        </div>
      </div>
    </div>
  )
}
