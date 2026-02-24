/**
 * migrate-railway-surveys.ts
 *
 * Migrates surveys from a Railway/Prisma PostgreSQL database to Compañeros en Ruta.
 * Handles 3 surveys, ~15 sections, ~167 questions, ~234 responses.
 *
 * Prerequisites:
 *   - npm install pg (devDependency)
 *   - npm install tsx (devDependency, if not already)
 *   - The `survey_sections` migration must be applied to CeR
 *
 * Usage:
 *   npx tsx scripts/migrate-railway-surveys.ts \
 *     --railway-url "postgresql://user:pass@host:port/db" \
 *     --supabase-url "https://xxx.supabase.co" \
 *     --supabase-key "service_role_key" \
 *     --tenant-id "uuid" \
 *     --brand-id "uuid" \
 *     --created-by "uuid"
 *
 * Or via environment variables:
 *   RAILWAY_DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { Client as PgClient } from 'pg'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function getArg(name: string, envKey?: string): string {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
  if (envKey && process.env[envKey]) return process.env[envKey]!
  throw new Error(`Missing required argument --${name}${envKey ? ` or env ${envKey}` : ''}`)
}

const RAILWAY_URL = getArg('railway-url', 'RAILWAY_DATABASE_URL')
const SUPABASE_URL = getArg('supabase-url', 'SUPABASE_URL')
const SUPABASE_KEY = getArg('supabase-key', 'SUPABASE_SERVICE_ROLE_KEY')
const TENANT_ID = getArg('tenant-id')
const BRAND_ID = getArg('brand-id')
const CREATED_BY = getArg('created-by')

const DRY_RUN = process.argv.includes('--dry-run')

// ---------------------------------------------------------------------------
// Railway types (Prisma schema)
// ---------------------------------------------------------------------------

interface RailwayEncuesta {
  id: number
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

interface RailwaySection {
  id: number
  encuestaId: number
  title: string
  description: string | null
  order: number
}

interface RailwayQuestion {
  id: number
  encuestaId: number
  sectionId: number | null
  question: string
  questionType: string
  options: string | null // semicolon-separated
  isRequired: boolean
  order: number
  placeholder: string | null
  maxLength: number | null
  max: number | null
  count: number | null
  prefix: string | null
  suffix: string | null
}

interface RailwayResponse {
  id: number
  encuestaId: number
  answers: Record<string, unknown> // JSON
  createdAt: Date
}

// ---------------------------------------------------------------------------
// CeR question type mapping
// ---------------------------------------------------------------------------

const QUESTION_TYPE_MAP: Record<string, string> = {
  text: 'text',
  text_box: 'text',
  number: 'number',
  single_choice: 'multiple_choice',
  multi_choice: 'checkbox',
  ordered_list: 'ordered_list',
  percentages_sum_100: 'percentage_distribution',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseOptions(raw: string | null): Array<{ value: string; label: string }> | null {
  if (!raw || !raw.trim()) return null
  return raw.split(';').map(opt => ({
    value: opt.trim().toLowerCase().replace(/\s+/g, '_'),
    label: opt.trim(),
  }))
}

function buildInputAttributes(q: RailwayQuestion): Record<string, unknown> | null {
  const attrs: Record<string, unknown> = {}
  if (q.placeholder) attrs.placeholder = q.placeholder
  if (q.maxLength) attrs.maxLength = q.maxLength
  if (q.max) attrs.max = q.max
  if (q.count) attrs.count = q.count
  if (q.prefix) attrs.prefix = q.prefix
  if (q.suffix) attrs.suffix = q.suffix
  return Object.keys(attrs).length > 0 ? attrs : null
}

function mapAnswerValue(
  questionType: string,
  value: unknown
): {
  answer_text?: string
  answer_number?: number
  answer_choice?: string
  answer_choices?: string[]
  answer_json?: Record<string, unknown>
} {
  if (value === null || value === undefined || value === '') return {}

  switch (questionType) {
    case 'text':
    case 'text_box':
      return { answer_text: String(value) }
    case 'number':
      return { answer_number: Number(value) }
    case 'single_choice':
      return { answer_choice: String(value) }
    case 'multi_choice':
      if (Array.isArray(value)) return { answer_choices: value.map(String) }
      return { answer_choices: [String(value)] }
    case 'ordered_list':
      if (Array.isArray(value)) return { answer_json: { ordered_values: value } }
      return { answer_json: { ordered_values: [value] } }
    case 'percentages_sum_100':
      if (typeof value === 'object' && !Array.isArray(value)) {
        return { answer_json: value as Record<string, unknown> }
      }
      return { answer_text: String(value) }
    default:
      return { answer_text: String(value) }
  }
}

// ---------------------------------------------------------------------------
// Main migration logic
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Railway → CeR Survey Migration ===')
  console.log(`Tenant: ${TENANT_ID}`)
  console.log(`Brand: ${BRAND_ID}`)
  console.log(`Created by: ${CREATED_BY}`)
  if (DRY_RUN) console.log('*** DRY RUN — no writes ***')
  console.log()

  // --- Connect to Railway ---
  const railway = new PgClient({ connectionString: RAILWAY_URL })
  await railway.connect()
  console.log('✓ Connected to Railway')

  // --- Connect to Supabase (admin) ---
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  console.log('✓ Connected to Supabase')

  // --- Read Railway data ---
  const encuestas = (await railway.query('SELECT * FROM "Encuesta" ORDER BY id')).rows as RailwayEncuesta[]
  const sections = (await railway.query('SELECT * FROM "Section" ORDER BY "encuestaId", "order", id')).rows as RailwaySection[]
  const questions = (await railway.query('SELECT * FROM "Question" ORDER BY "encuestaId", "sectionId", "order", id')).rows as RailwayQuestion[]
  const responses = (await railway.query('SELECT * FROM "Response" ORDER BY "encuestaId", id')).rows as RailwayResponse[]

  console.log(`\nRailway data:`)
  console.log(`  Encuestas: ${encuestas.length}`)
  console.log(`  Sections:  ${sections.length}`)
  console.log(`  Questions: ${questions.length}`)
  console.log(`  Responses: ${responses.length}`)

  if (DRY_RUN) {
    console.log('\n--- DRY RUN: Showing data summary ---')
    for (const enc of encuestas) {
      const qs = questions.filter(q => q.encuestaId === enc.id)
      const ss = sections.filter(s => s.encuestaId === enc.id)
      const rs = responses.filter(r => r.encuestaId === enc.id)
      console.log(`\n  [${enc.id}] "${enc.title}"`)
      console.log(`    Sections: ${ss.length}, Questions: ${qs.length}, Responses: ${rs.length}`)
      for (const q of qs.slice(0, 3)) {
        console.log(`    Q${q.id}: [${q.questionType}] "${q.question.substring(0, 60)}"`)
      }
      if (qs.length > 3) console.log(`    ... and ${qs.length - 3} more questions`)
    }
    await railway.end()
    console.log('\n✓ Dry run complete')
    return
  }

  // --- ID maps ---
  const surveyIdMap = new Map<number, string>()      // Railway encuesta.id → CeR survey.id
  const sectionIdMap = new Map<number, string>()      // Railway section.id → CeR section.id
  const questionIdMap = new Map<number, string>()     // Railway question.id → CeR question.id
  const questionTypeMap = new Map<number, string>()   // Railway question.id → Railway questionType
  // For encuesta 1: question text → CeR question.id
  const questionTextMap = new Map<string, string>()

  // Track counts
  let totalSurveys = 0
  let totalSections = 0
  let totalQuestions = 0
  let totalResponses = 0
  let totalAnswers = 0

  // --- Migrate each encuesta ---
  for (const enc of encuestas) {
    console.log(`\n--- Migrating Encuesta ${enc.id}: "${enc.title}" ---`)

    // 1. Create survey
    const surveyInsert = {
      tenant_id: TENANT_ID,
      brand_id: BRAND_ID,
      created_by: CREATED_BY,
      title: enc.title,
      description: enc.description || undefined,
      survey_status: 'closed' as const,
      target_roles: ['promotor'],
      start_date: enc.createdAt,
      end_date: enc.updatedAt || enc.createdAt,
    }

    const { data: survey, error: surveyErr } = await supabase
      .from('surveys')
      .insert(surveyInsert)
      .select('id')
      .single()

    if (surveyErr || !survey) {
      console.error(`  ✗ Failed to create survey: ${surveyErr?.message}`)
      continue
    }
    surveyIdMap.set(enc.id, survey.id)
    totalSurveys++
    console.log(`  ✓ Survey created: ${survey.id}`)

    // 2. Create sections for this encuesta
    const encSections = sections.filter(s => s.encuestaId === enc.id)
    for (let i = 0; i < encSections.length; i++) {
      const s = encSections[i]
      const visibilityCondition = buildVisibilityCondition(s, questions, enc.id)

      const sectionInsert = {
        survey_id: survey.id,
        tenant_id: TENANT_ID,
        title: s.title,
        description: s.description || undefined,
        sort_order: i,
        visibility_condition: visibilityCondition,
      }

      const { data: section, error: secErr } = await supabase
        .from('survey_sections')
        .insert(sectionInsert)
        .select('id')
        .single()

      if (secErr || !section) {
        console.error(`  ✗ Failed to create section "${s.title}": ${secErr?.message}`)
        continue
      }
      sectionIdMap.set(s.id, section.id)
      totalSections++
    }
    console.log(`  ✓ ${encSections.length} sections created`)

    // 3. Create questions for this encuesta
    const encQuestions = questions.filter(q => q.encuestaId === enc.id)
    for (let i = 0; i < encQuestions.length; i++) {
      const q = encQuestions[i]
      const cerType = QUESTION_TYPE_MAP[q.questionType]
      if (!cerType) {
        console.error(`  ✗ Unknown question type "${q.questionType}" for Q${q.id}`)
        continue
      }

      questionTypeMap.set(q.id, q.questionType)

      const options = parseOptions(q.options)
      const inputAttrs = buildInputAttributes(q)

      const questionInsert = {
        survey_id: survey.id,
        tenant_id: TENANT_ID,
        question_text: q.question,
        question_type: cerType,
        is_required: q.isRequired,
        sort_order: i,
        options: options,
        section_id: q.sectionId ? sectionIdMap.get(q.sectionId) || null : null,
        input_attributes: inputAttrs,
      }

      const { data: question, error: qErr } = await supabase
        .from('survey_questions')
        .insert(questionInsert)
        .select('id')
        .single()

      if (qErr || !question) {
        console.error(`  ✗ Failed to create question Q${q.id}: ${qErr?.message}`)
        continue
      }
      questionIdMap.set(q.id, question.id)
      questionTextMap.set(q.question, question.id)
      totalQuestions++
    }
    console.log(`  ✓ ${encQuestions.length} questions created`)

    // 4. Migrate responses
    const encResponses = responses.filter(r => r.encuestaId === enc.id)
    const isFirstEncuesta = enc.id === encuestas[0].id

    if (isFirstEncuesta) {
      // Encuesta 1: single anonymous respondent for all responses
      const respondentId = await getOrCreateRespondent(
        supabase,
        TENANT_ID,
        'Encuestador',
        'Anónimo'
      )
      if (!respondentId) {
        console.error('  ✗ Failed to create anonymous respondent')
        continue
      }

      for (const resp of encResponses) {
        const { answers: answersCount } = await migrateResponse(
          supabase, survey.id, respondentId, resp,
          encQuestions, questionIdMap, questionTextMap, questionTypeMap,
          true // keys are question text
        )
        totalResponses++
        totalAnswers += answersCount
      }
    } else {
      // Encuestas 2 & 3: first question is the respondent name
      for (const resp of encResponses) {
        const answers = resp.answers as Record<string, unknown>
        // Find the name from the first question
        const firstQ = encQuestions[0]
        const nameKey = firstQ ? String(firstQ.id) : null
        const rawName = nameKey ? String(answers[nameKey] || '') : ''
        const nameParts = rawName.trim().split(/\s+/)
        const firstName = nameParts[0] || 'Sin'
        const lastName = nameParts.slice(1).join(' ') || 'Nombre'

        const respondentId = await getOrCreateRespondent(
          supabase,
          TENANT_ID,
          firstName,
          lastName
        )
        if (!respondentId) {
          console.error(`  ✗ Failed to create respondent "${rawName}"`)
          continue
        }

        const { answers: answersCount } = await migrateResponse(
          supabase, survey.id, respondentId, resp,
          encQuestions, questionIdMap, questionTextMap, questionTypeMap,
          false // keys are question IDs
        )
        totalResponses++
        totalAnswers += answersCount
      }
    }
    console.log(`  ✓ ${encResponses.length} responses migrated`)
  }

  // --- Summary ---
  console.log('\n=== Migration Complete ===')
  console.log(`  Surveys:   ${totalSurveys}`)
  console.log(`  Sections:  ${totalSections}`)
  console.log(`  Questions: ${totalQuestions}`)
  console.log(`  Responses: ${totalResponses}`)
  console.log(`  Answers:   ${totalAnswers}`)

  console.log('\n--- ID Mapping ---')
  console.log('Surveys:')
  for (const [railwayId, cerId] of surveyIdMap) {
    console.log(`  Railway ${railwayId} → ${cerId}`)
  }
  console.log('Sections:')
  for (const [railwayId, cerId] of sectionIdMap) {
    console.log(`  Railway ${railwayId} → ${cerId}`)
  }

  await railway.end()
  console.log('\n✓ Done')
}

// ---------------------------------------------------------------------------
// Visibility condition builder
// ---------------------------------------------------------------------------

function buildVisibilityCondition(
  section: RailwaySection,
  allQuestions: RailwayQuestion[],
  encuestaId: number
): Record<string, unknown> | null {
  // Hardcoded logic: sections 6 and 7 in the Railway DB are conditional
  // on "tipo de negocio" question. This maps the Railway conditional display
  // to CeR's visibility_condition format.
  //
  // Since we don't know the exact section IDs that are conditional in advance,
  // check if the section title suggests conditionality. The actual mapping
  // should be verified against the Railway data.
  //
  // For now, return null (always visible). The user can manually set
  // visibility_condition after migration if needed, or this function can be
  // updated with the actual Railway section IDs once known.
  return null
}

// ---------------------------------------------------------------------------
// Respondent management
// ---------------------------------------------------------------------------

const respondentCache = new Map<string, string>()

async function getOrCreateRespondent(
  supabase: SupabaseClient,
  tenantId: string,
  firstName: string,
  lastName: string
): Promise<string | null> {
  const cacheKey = `${firstName}|${lastName}`.toLowerCase()
  if (respondentCache.has(cacheKey)) return respondentCache.get(cacheKey)!

  // Try to find existing user_profile
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('tenant_id', tenantId)
    .ilike('first_name', firstName)
    .ilike('last_name', lastName)
    .limit(1)
    .maybeSingle()

  if (existing) {
    respondentCache.set(cacheKey, existing.id)
    return existing.id
  }

  // Create placeholder user_profile
  // Note: This creates a profile without an auth user. The script runner
  // may need to create auth users separately or link them later.
  const { data: created, error } = await supabase
    .from('user_profiles')
    .insert({
      tenant_id: tenantId,
      user_id: crypto.randomUUID(), // placeholder — no real auth user
      first_name: firstName,
      last_name: lastName,
      email: `placeholder-${Date.now()}-${Math.random().toString(36).slice(2)}@migration.local`,
      status: 'inactive',
    })
    .select('id')
    .single()

  if (error || !created) {
    console.error(`    ✗ Failed to create user_profile for "${firstName} ${lastName}": ${error?.message}`)
    return null
  }

  respondentCache.set(cacheKey, created.id)
  return created.id
}

// ---------------------------------------------------------------------------
// Response migration
// ---------------------------------------------------------------------------

async function migrateResponse(
  supabase: SupabaseClient,
  surveyId: string,
  respondentId: string,
  response: RailwayResponse,
  encQuestions: RailwayQuestion[],
  questionIdMap: Map<number, string>,
  questionTextMap: Map<string, string>,
  questionTypeMap: Map<number, string>,
  keysByText: boolean
): Promise<{ answers: number }> {
  // Create survey_response
  const { data: surveyResponse, error: respErr } = await supabase
    .from('survey_responses')
    .insert({
      survey_id: surveyId,
      tenant_id: TENANT_ID,
      respondent_id: respondentId,
      respondent_role: 'promotor',
      submitted_at: response.createdAt,
    })
    .select('id')
    .single()

  if (respErr || !surveyResponse) {
    console.error(`    ✗ Failed to create response: ${respErr?.message}`)
    return { answers: 0 }
  }

  // Create survey_answers
  const rawAnswers = response.answers as Record<string, unknown>
  const answerInserts: Array<Record<string, unknown>> = []

  for (const [key, value] of Object.entries(rawAnswers)) {
    if (value === null || value === undefined || value === '') continue

    let cerQuestionId: string | undefined
    let railwayType: string | undefined

    if (keysByText) {
      // Encuesta 1: key is the question text
      cerQuestionId = questionTextMap.get(key)
      if (cerQuestionId) {
        const railwayQ = encQuestions.find(q => q.question === key)
        railwayType = railwayQ?.questionType
      }
    } else {
      // Encuestas 2 & 3: key is the Railway question ID
      const railwayId = parseInt(key, 10)
      if (!isNaN(railwayId)) {
        cerQuestionId = questionIdMap.get(railwayId)
        railwayType = questionTypeMap.get(railwayId)
      }
    }

    if (!cerQuestionId) continue

    const mapped = mapAnswerValue(railwayType || 'text', value)
    answerInserts.push({
      response_id: surveyResponse.id,
      question_id: cerQuestionId,
      tenant_id: TENANT_ID,
      ...mapped,
    })
  }

  if (answerInserts.length > 0) {
    const { error: ansErr } = await supabase
      .from('survey_answers')
      .insert(answerInserts)

    if (ansErr) {
      console.error(`    ✗ Failed to insert answers: ${ansErr.message}`)
      return { answers: 0 }
    }
  }

  return { answers: answerInserts.length }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
