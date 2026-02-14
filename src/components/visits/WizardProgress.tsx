'use client'

import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStage {
  id: string
  label: string
  shortLabel: string
  isCompleted: boolean
  isActive: boolean
  isSaving?: boolean
}

interface WizardProgressProps {
  stages: WizardStage[]
  currentStage: number
  onStageClick?: (stageIndex: number) => void
  className?: string
}

export function WizardProgress({
  stages,
  currentStage,
  onStageClick,
  className
}: WizardProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop view */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {stages.map((stage, index) => (
              <li key={stage.id} className="relative flex-1">
                <div className="flex items-center">
                  {/* Line connector */}
                  {index !== 0 && (
                    <div
                      className={cn(
                        'absolute top-4 -left-1/2 w-full h-0.5 -z-10',
                        stages[index - 1].isCompleted
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      )}
                    />
                  )}

                  {/* Step button */}
                  <button
                    type="button"
                    onClick={() => onStageClick?.(index)}
                    disabled={!onStageClick || (!stage.isCompleted && index > currentStage)}
                    className={cn(
                      'relative flex flex-col items-center group',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg p-2',
                      onStageClick && (stage.isCompleted || index <= currentStage) && 'cursor-pointer',
                      (!onStageClick || (!stage.isCompleted && index > currentStage)) && 'cursor-default'
                    )}
                  >
                    {/* Circle indicator */}
                    <span
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                        stage.isCompleted && 'bg-blue-600 border-blue-600',
                        stage.isActive && !stage.isCompleted && 'border-blue-600 bg-white',
                        !stage.isActive && !stage.isCompleted && 'border-gray-300 bg-white'
                      )}
                    >
                      {stage.isSaving ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : stage.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <span
                          className={cn(
                            'text-sm font-medium',
                            stage.isActive ? 'text-blue-600' : 'text-gray-500'
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium text-center',
                        stage.isActive ? 'text-blue-600' : 'text-gray-500'
                      )}
                    >
                      {stage.label}
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
          {stages.map((stage, index) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => onStageClick?.(index)}
              disabled={!onStageClick || (!stage.isCompleted && index > currentStage)}
              className={cn(
                'flex flex-col items-center',
                'focus:outline-none'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                  stage.isCompleted && 'bg-blue-600 border-blue-600',
                  stage.isActive && !stage.isCompleted && 'border-blue-600 bg-white',
                  !stage.isActive && !stage.isCompleted && 'border-gray-300 bg-white'
                )}
              >
                {stage.isSaving ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : stage.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      stage.isActive ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'mt-1 text-xs font-medium',
                  stage.isActive ? 'text-blue-600' : 'text-gray-500'
                )}
              >
                {stage.shortLabel}
              </span>
            </button>
          ))}
        </div>

        {/* Current stage indicator */}
        <div className="px-4 py-2 bg-blue-50 border-b">
          <p className="text-sm text-blue-700 font-medium">
            Paso {currentStage + 1}: {stages[currentStage]?.label}
          </p>
        </div>
      </div>
    </div>
  )
}
