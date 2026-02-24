# Migración de Encuestas: Railway → Compañeros en Ruta

## Contexto

Se migran 3 encuestas (~167 preguntas, ~15 secciones, ~234 respuestas) desde una base de datos Railway/Prisma al sistema de encuestas de CeR.

## Prerequisitos

1. La migración `20260226100000_add_survey_sections.sql` debe estar aplicada
2. Dependencias instaladas: `npm install --save-dev pg tsx`
3. Conexión a Railway PostgreSQL (connection string)
4. Service role key de Supabase

## Nuevas Features Implementadas

### 1. Tabla `survey_sections`

Nueva tabla para agrupar preguntas por secciones dentro de una encuesta.

```sql
CREATE TABLE survey_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visibility_condition JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2. Nuevas columnas en `survey_questions`

- `section_id UUID` — FK a `survey_sections`, nullable (backward compatible)
- `input_attributes JSONB` — Metadata de presentación del input

### 3. `visibility_condition` (lógica condicional)

Permite mostrar/ocultar secciones según la respuesta a otra pregunta:

```jsonc
{
  "question_id": "<uuid>",
  "operator": "in" | "not_in" | "equals" | "not_equals",
  "values": ["valor1", "valor2"]
}
// null = sección siempre visible
```

### 4. `input_attributes` (atributos del input)

Metadata para personalizar la presentación del input HTML:

```jsonc
{
  "placeholder": "Escribe aquí...",
  "maxLength": 500,
  "max": 100,
  "count": 3,
  "prefix": "$",
  "suffix": "kg"
}
```

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260226100000_add_survey_sections.sql` | DDL completo |
| `src/lib/types/database.ts` | Tipos: `SurveySection`, `VisibilityCondition`, `InputAttributes` |
| `src/lib/types/supabase.ts` | Tipos auto-generados actualizados |
| `src/components/surveys/SurveyForm.tsx` | Renderizado por secciones + visibilidad condicional |
| `src/components/surveys/SurveyQuestionBuilder.tsx` | Editor de secciones, condiciones, atributos |
| `src/app/api/brand/surveys/[id]/route.ts` | GET/PUT con secciones |
| `src/app/api/brand/surveys/route.ts` | POST con secciones |
| `src/app/api/surveys/[id]/route.ts` | GET con secciones |
| `src/app/api/surveys/[id]/respond/route.ts` | section_id en questions |
| `src/app/api/admin/surveys/[id]/route.ts` | GET/PUT con secciones |
| `src/app/(dashboard)/brand/surveys/create/page.tsx` | UI de secciones en wizard |
| `src/app/(dashboard)/brand/surveys/[id]/page.tsx` | Secciones en detalle |
| `src/app/(dashboard)/admin/surveys/[id]/page.tsx` | Secciones en admin |
| `src/components/surveys/SurveyRespondPage.tsx` | Pasa secciones a SurveyForm |

## Script de Migración

### Uso

```bash
# Instalar dependencias (solo primera vez)
npm install --save-dev pg tsx

# Dry run (solo muestra datos, no escribe)
npx tsx scripts/migrate-railway-surveys.ts \
  --railway-url "postgresql://user:pass@host:port/db" \
  --supabase-url "https://xxx.supabase.co" \
  --supabase-key "service_role_key" \
  --tenant-id "uuid-del-tenant" \
  --brand-id "uuid-de-la-marca" \
  --created-by "uuid-del-usuario" \
  --dry-run

# Ejecución real
npx tsx scripts/migrate-railway-surveys.ts \
  --railway-url "postgresql://user:pass@host:port/db" \
  --supabase-url "https://xxx.supabase.co" \
  --supabase-key "service_role_key" \
  --tenant-id "uuid-del-tenant" \
  --brand-id "uuid-de-la-marca" \
  --created-by "uuid-del-usuario"
```

### Mapeo de Tipos de Pregunta

| Railway | CeR |
|---------|-----|
| `text` / `text_box` | `text` |
| `number` | `number` |
| `single_choice` | `multiple_choice` |
| `multi_choice` | `checkbox` |
| `ordered_list` | `ordered_list` |
| `percentages_sum_100` | `percentage_distribution` |

### Mapeo de Respuestas

| Tipo Railway | Campo CeR |
|-------------|-----------|
| `text` / `text_box` | `answer_text` |
| `number` | `answer_number` |
| `single_choice` | `answer_choice` |
| `multi_choice` | `answer_choices` (text[]) |
| `ordered_list` | `answer_json: { ordered_values: [...] }` |
| `percentages_sum_100` | `answer_json: { label: percent, ... }` |

### Manejo de Respondentes

- **Encuesta 1**: Todas las respuestas se asignan a un perfil "Encuestador Anónimo"
- **Encuestas 2 y 3**: La primera pregunta contiene el nombre del encuestador. Se busca/crea un `user_profile` por nombre

### Nota sobre `visibility_condition`

Las secciones condicionales (secciones 6 y 7 de Railway, condicionales a "tipo de negocio") necesitan configurarse manualmente después de la migración. El script crea las secciones sin condiciones de visibilidad.

## Verificación Post-Migración

```sql
-- Conteos
SELECT 'surveys' as tabla, count(*) FROM surveys WHERE brand_id = '<brand_id>'
UNION ALL
SELECT 'sections', count(*) FROM survey_sections WHERE tenant_id = '<tenant_id>'
UNION ALL
SELECT 'questions', count(*) FROM survey_questions sq
  JOIN surveys s ON sq.survey_id = s.id WHERE s.brand_id = '<brand_id>'
UNION ALL
SELECT 'responses', count(*) FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id WHERE s.brand_id = '<brand_id>'
UNION ALL
SELECT 'answers', count(*) FROM survey_answers sa
  JOIN survey_responses sr ON sa.response_id = sr.id
  JOIN surveys s ON sr.survey_id = s.id WHERE s.brand_id = '<brand_id>';
```

Conteos esperados:
- Surveys: 3
- Sections: ~15
- Questions: ~167
- Responses: ~234
- Answers: variable (depende de cuántas preguntas respondió cada participante)
