import type { MultipleChoiceOption } from '@/lib/types/database'

/**
 * Normalizes multiple_choice options from DB format to the expected
 * MultipleChoiceOption[] format.
 *
 * Handles:
 *  - Already correct: [{value, label}]
 *  - DB seed format:  {choices: string[]}
 *  - null/undefined
 */
export function normalizeMultipleChoiceOptions(options: unknown): MultipleChoiceOption[] {
  if (Array.isArray(options)) {
    // Already [{value, label}] — or at least an array
    return options
  }
  if (options && typeof options === 'object' && 'choices' in options) {
    const choices = (options as { choices: unknown }).choices
    if (Array.isArray(choices)) {
      return choices.map((choice: string) => ({
        value: choice.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_áéíóúñü]/g, ''),
        label: choice,
      }))
    }
  }
  return []
}

interface ScaleOptions {
  min: number
  max: number
  min_label?: string
  max_label?: string
}

/**
 * Normalizes scale options from DB format to the expected {min, max, min_label, max_label}.
 *
 * Handles:
 *  - Already correct: {min, max, min_label?, max_label?}
 *  - DB seed format:  {min, max, labels: {"1": "...", "5": "..."}}
 *  - null/undefined
 */
export function normalizeScaleOptions(options: unknown): ScaleOptions {
  const defaults: ScaleOptions = { min: 1, max: 5 }
  if (!options || typeof options !== 'object') return defaults

  const opts = options as Record<string, unknown>
  const result: ScaleOptions = {
    min: typeof opts.min === 'number' ? opts.min : 1,
    max: typeof opts.max === 'number' ? opts.max : 5,
  }

  // Standard format: {min_label, max_label}
  if (typeof opts.min_label === 'string') result.min_label = opts.min_label
  if (typeof opts.max_label === 'string') result.max_label = opts.max_label

  // DB seed format: {labels: {"1": "Muy insatisfecho", "5": "Muy satisfecho"}}
  if (!result.min_label && !result.max_label && opts.labels && typeof opts.labels === 'object') {
    const labels = opts.labels as Record<string, string>
    const minLabel = labels[String(result.min)]
    const maxLabel = labels[String(result.max)]
    if (minLabel) result.min_label = minLabel
    if (maxLabel) result.max_label = maxLabel
  }

  return result
}
