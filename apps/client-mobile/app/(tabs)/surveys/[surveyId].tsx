import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import {
  isClientSubmitUnsupported,
  isDuplicateSurveyResponse,
  useSubmitSurvey,
  useSurvey,
  type SurveyQuestion,
} from '@/features/surveys/api'

// Survey input chips/options use StyleSheet for the same Pressable+map crash
// workaround documented in Button.tsx. These are screen-local; the broader
// SegmentedControl/FilterChip primitives don't fit the radio/checkbox visual
// of a survey question, so we keep the local StyleSheet here.

type Answers = Record<string, unknown>

export default function SurveyRunnerScreen() {
  const { surveyId } = useLocalSearchParams<{ surveyId: string }>()
  const surveyQuery = useSurvey(surveyId)
  const submit = useSubmitSurvey(surveyId!)
  const [answers, setAnswers] = useState<Answers>({})

  const survey = surveyQuery.data?.survey
  const hasResponded = surveyQuery.data?.has_responded ?? false
  const existingResponse = surveyQuery.data?.existing_response ?? null
  const sortedQuestions = useMemo(() => {
    const qs = survey?.survey_questions ?? []
    return [...qs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [survey])

  function setAnswer(id: string, value: unknown) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  async function onSubmit() {
    const missing = sortedQuestions.filter(q => {
      if (!q.is_required) return false
      const v = answers[q.id]
      if (v == null) return true
      if (typeof v === 'string' && v.trim() === '') return true
      if (Array.isArray(v) && v.length === 0) return true
      return false
    })
    if (missing.length > 0) {
      Alert.alert(
        'Faltan respuestas',
        `Te faltan ${missing.length} pregunta(s) marcadas como requeridas.`
      )
      return
    }
    try {
      await submit.mutateAsync(
        sortedQuestions.map(q => {
          const v = answers[q.id]
          return {
            question_id: q.id,
            answer_text: typeof v === 'string' ? v : null,
            answer_value: v,
          }
        })
      )
      Alert.alert('¡Gracias!', 'Tu respuesta fue registrada.', [
        { text: 'Volver', onPress: () => router.back() },
      ])
    } catch (e) {
      if (isDuplicateSurveyResponse(e)) {
        Alert.alert(
          'Ya respondiste',
          'Ya enviaste tu respuesta a esta encuesta. ¡Gracias!',
          [{ text: 'Volver', onPress: () => router.back() }]
        )
        return
      }
      if (isClientSubmitUnsupported(e)) {
        Alert.alert(
          'Aún no soportado',
          'La captura de respuestas para clientes está en desarrollo en el backend. Tu respuesta no se guardó.'
        )
        return
      }
      Alert.alert('Error al enviar', e instanceof Error ? e.message : 'Inténtalo de nuevo')
    }
  }

  if (surveyQuery.isLoading || !survey) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <ScreenHeader title="Encuesta" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    )
  }

  if (surveyQuery.error) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <ScreenHeader title="Encuesta" showBack />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-destructive text-center">
            {surveyQuery.error instanceof Error
              ? surveyQuery.error.message
              : 'No pudimos cargar la encuesta'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (hasResponded) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <ScreenHeader title={survey.title} showBack />
        <View className="flex-1 items-center justify-center px-6">
          <Card className="w-full items-center">
            <Text className="text-base font-bold text-navy text-center mb-2">
              Ya respondiste esta encuesta
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-4">
              {existingResponse?.submitted_at
                ? `Enviada el ${new Date(existingResponse.submitted_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}. ¡Gracias por tus respuestas!`
                : '¡Gracias por tus respuestas!'}
            </Text>
            <Button onPress={() => router.back()} variant="default" size="default">
              Volver
            </Button>
          </Card>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title={survey.title} showBack />
      <ScrollView contentContainerClassName="p-4 pb-32">
        <Card className="mb-3">
          <View className="flex-row items-center mb-2">
            <BrandLogo
              logoUrl={survey.brands?.logo_url ?? null}
              name={survey.brands?.name ?? 'Marca'}
              size={32}
            />
            <Text className="text-xs text-muted-foreground ml-2 flex-1" numberOfLines={1}>
              {survey.brands?.name ?? 'Encuesta'}
            </Text>
          </View>
          <Text className="text-base font-bold text-navy">{survey.title}</Text>
          {survey.description && (
            <Text className="text-sm text-navy mt-2">{survey.description}</Text>
          )}
        </Card>

        {sortedQuestions.map((q, idx) => (
          <QuestionRow
            key={q.id}
            index={idx + 1}
            question={q}
            value={answers[q.id]}
            onChange={v => setAnswer(q.id, v)}
          />
        ))}
      </ScrollView>

      <View
        className="px-4 py-3 bg-card"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}
      >
        <Button
          onPress={onSubmit}
          variant="default"
          size="lg"
          fullWidth
          loading={submit.isPending}
        >
          Enviar respuestas
        </Button>
      </View>
    </SafeAreaView>
  )
}

interface QuestionRowProps {
  index: number
  question: SurveyQuestion
  value: unknown
  onChange: (v: unknown) => void
}

function QuestionRow({ index, question, value, onChange }: QuestionRowProps) {
  return (
    <Card className="mb-2">
      <Text className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">
        Pregunta {index} {question.is_required ? '· requerida' : ''}
      </Text>
      <Text className="text-sm font-bold text-navy mb-2">
        {question.question_text}
      </Text>
      <QuestionInput question={question} value={value} onChange={onChange} />
    </Card>
  )
}

function QuestionInput({ question, value, onChange }: Omit<QuestionRowProps, 'index'>) {
  const t = question.question_type

  if (t === 'text' || t === 'long_text' || t === 'text_long' || t === 'textarea') {
    return (
      <Input
        placeholder="Tu respuesta…"
        value={typeof value === 'string' ? value : ''}
        onChangeText={onChange}
        multiline={t !== 'text'}
        style={t !== 'text' ? { minHeight: 70, height: undefined, paddingTop: 10 } : undefined}
      />
    )
  }

  if (t === 'number' || t === 'numeric') {
    return (
      <Input
        keyboardType="number-pad"
        placeholder="0"
        value={typeof value === 'string' ? value : value != null ? String(value) : ''}
        onChangeText={onChange}
      />
    )
  }

  if (t === 'yes_no' || t === 'boolean') {
    return (
      <View style={inputStyles.row}>
        {([
          { v: true, label: 'Sí' },
          { v: false, label: 'No' },
        ]).map(opt => {
          const selected = value === opt.v
          return (
            <Pressable
              key={String(opt.v)}
              style={[inputStyles.chip, selected && inputStyles.chipSelected]}
              onPress={() => onChange(opt.v)}
              hitSlop={8}
              android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            >
              <Text style={[inputStyles.chipLabel, selected && inputStyles.chipLabelSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  if (t === 'rating' || t === 'scale') {
    const max = 5
    const current = typeof value === 'number' ? value : 0
    return (
      <View style={inputStyles.row}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => {
          const selected = current === n
          return (
            <Pressable
              key={n}
              style={[inputStyles.chip, selected && inputStyles.chipSelected]}
              onPress={() => onChange(n)}
              hitSlop={8}
              android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            >
              <Text style={[inputStyles.chipLabel, selected && inputStyles.chipLabelSelected]}>
                {n}
              </Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  const options = question.options ?? []
  const isMulti = t === 'multiple_choice_multi' || t === 'checkboxes' || t === 'multi_select'

  return (
    <View>
      {options.map(opt => {
        const selected = isMulti
          ? Array.isArray(value) && value.includes(opt.value)
          : value === opt.value
        return (
          <Pressable
            key={opt.value}
            style={[inputStyles.option, selected && inputStyles.optionSelected]}
            onPress={() => {
              if (isMulti) {
                const arr = Array.isArray(value) ? (value as string[]) : []
                const next = arr.includes(opt.value)
                  ? arr.filter(v => v !== opt.value)
                  : [...arr, opt.value]
                onChange(next)
              } else {
                onChange(opt.value)
              }
            }}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
          >
            <View style={[inputStyles.bullet, selected && inputStyles.bulletSelected]}>
              {selected && <Text style={inputStyles.bulletTick}>✓</Text>}
            </View>
            <Text style={[inputStyles.optionLabel, selected && inputStyles.optionLabelSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
      {options.length === 0 && (
        <Text className="text-xs text-muted-foreground">
          Sin opciones disponibles para esta pregunta (tipo: {t}).
        </Text>
      )}
    </View>
  )
}

const inputStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
  },
  chipSelected: { backgroundColor: '#4d71ed', borderColor: '#4d71ed' },
  chipLabel: { fontSize: 13, color: '#4b5563', fontFamily: 'NunitoSans_700Bold' },
  chipLabelSelected: { color: '#ffffff' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(204,204,204,0.6)',
    marginBottom: 6,
    backgroundColor: '#ffffff',
  },
  optionSelected: { borderColor: '#4d71ed', backgroundColor: 'rgba(77,113,237,0.08)' },
  bullet: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bulletSelected: { backgroundColor: '#4d71ed', borderColor: '#4d71ed' },
  bulletTick: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  optionLabel: { fontSize: 14, color: '#374151', flex: 1 },
  optionLabelSelected: { color: '#202456', fontFamily: 'NunitoSans_700Bold' },
})
