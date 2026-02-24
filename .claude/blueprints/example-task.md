# Example Task Blueprint

## Contexto
Esta es una plantilla para crear tareas específicas en **Compañeros en Ruta**. Cada tarea debe seguir esta estructura para mantener consistencia y adherirse a las reglas del CLAUDE.md.

---

## 🚨 For Agents/Subagents: Compliance First

**If you are a subagent executing this task:**

1. **READ** [../agents.md](../agents.md) and [../../CLAUDE.md](../../CLAUDE.md) FIRST
2. **VERIFY** schema from migrations or local DB before proceeding
3. **FOLLOW** the verification checklist in [agents.md](../agents.md)
4. **ACKNOWLEDGE** compliance: "✓ I have read CLAUDE.md and agents.md"

**If you skip these steps, your implementation may be rejected.**

---

## TASK: [NOMBRE_DESCRIPTIVO]

### Objetivo
[Descripción clara de lo que se quiere lograr]

### Contexto del Dominio
[Explicar en qué parte del sistema multi-tenant encaja esta tarea]
- **Tenant**: [si aplica a nivel tenant]
- **Brand**: [si es específico de marca]
- **Role**: [qué roles de usuario están involucrados]
- **Tables**: [tablas principales que se verán afectadas]

### Prerequisites - Schema Verification
**OBLIGATORIO**: Antes de cualquier implementación:

```sql
-- Verificar esquema actual de las tablas relevantes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('tabla1', 'tabla2')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Verificar políticas RLS existentes
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('tabla1', 'tabla2');
```

### Implementación Step-by-Step

#### 1. Database Changes (si necesario)
```sql
-- Crear migración si se requieren cambios de esquema
-- Archivo: supabase/migrations/YYYYMMDDHHMMSS_task_name.sql

BEGIN;

-- DDL changes
CREATE TABLE IF NOT EXISTS nueva_tabla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    -- campos específicos...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON nueva_tabla
    FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Triggers
CREATE TRIGGER trigger_nueva_tabla_updated_at
    BEFORE UPDATE ON nueva_tabla
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

#### 2. Types & Validation
```typescript
// src/lib/types/task-types.ts
export interface TaskEntity {
  id: string
  tenant_id: string
  // campos específicos...
  created_at: string
  updated_at: string
}

// src/lib/validation/task-schemas.ts
import { z } from 'zod'

export const taskCreateSchema = z.object({
  field1: z.string().min(1).max(100),
  field2: z.string().uuid().optional(),
  // otras validaciones...
})

export type TaskCreateForm = z.infer<typeof taskCreateSchema>
```

#### 3. API Routes
```typescript
// src/app/api/[domain]/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { checkRole } from '@/lib/auth/permissions'
import { taskCreateSchema } from '@/lib/validation/task-schemas'

export async function GET(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    // Verificar permisos
    const hasAccess = await checkRole(supabase, user.id, 'required_role')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Query con RLS automático
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    try {
      const body = await request.json()
      const validatedData = taskCreateSchema.parse(body)

      // Obtener contexto del tenant
      const { tenantId } = await getTenantContext(supabase)

      const { data, error } = await supabase
        .from('table_name')
        .insert({
          ...validatedData,
          tenant_id: tenantId,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
      return handleApiError(error)
    }
  })
}
```

#### 4. Services & Hooks
```typescript
// src/lib/services/taskService.ts
export class TaskService {
  constructor(private supabase: SupabaseClient) {}

  async createTask(data: TaskCreateForm): Promise<TaskEntity> {
    const { data: result, error } = await this.supabase
      .from('table_name')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return result
  }

  async listTasks(filters?: TaskFilters): Promise<TaskEntity[]> {
    let query = this.supabase
      .from('table_name')
      .select('*')

    // Aplicar filtros si existen
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data || []
  }
}

// src/hooks/useTasks.ts
import useSWR from 'swr'

export function useTasks(filters?: TaskFilters) {
  const { data, error, mutate } = useSWR(
    ['tasks', filters],
    () => fetch('/api/path/to/tasks').then(r => r.json())
  )

  return {
    tasks: data?.data || [],
    error,
    loading: !data && !error,
    refresh: mutate
  }
}
```

#### 5. UI Components
```tsx
// src/components/task/TaskForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskCreateSchema, TaskCreateForm } from '@/lib/validation/task-schemas'

interface TaskFormProps {
  onSuccess?: (task: TaskEntity) => void
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const form = useForm<TaskCreateForm>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      field1: '',
      field2: undefined
    }
  })

  async function onSubmit(data: TaskCreateForm) {
    try {
      const response = await fetch('/api/path/to/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const result = await response.json()
      onSuccess?.(result.data)
      form.reset()
    } catch (error) {
      console.error('Error:', error)
      // Handle error state
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </form>
    </Form>
  )
}

// src/components/task/TaskList.tsx
export function TaskList() {
  const { tasks, loading, error } = useTasks()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

#### 6. Page Integration
```tsx
// src/app/(dashboard)/[role]/tasks/page.tsx
import { TaskForm } from '@/components/task/TaskForm'
import { TaskList } from '@/components/task/TaskList'

export default function TasksPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### Testing Strategy

#### 1. Database Tests
```typescript
// __tests__/database/task-policies.test.ts
describe('Task RLS Policies', () => {
  it('should isolate tasks by tenant', async () => {
    // Test tenant isolation
  })

  it('should respect role permissions', async () => {
    // Test role-based access
  })
})
```

#### 2. API Tests
```typescript
// __tests__/api/task.test.ts
describe('/api/tasks', () => {
  it('should create task with valid data', async () => {
    // Test successful creation
  })

  it('should reject invalid input', async () => {
    // Test validation
  })

  it('should require authentication', async () => {
    // Test auth requirement
  })
})
```

#### 3. Component Tests
```typescript
// __tests__/components/TaskForm.test.tsx
describe('TaskForm', () => {
  it('should submit valid form', async () => {
    // Test form submission
  })

  it('should show validation errors', async () => {
    // Test validation display
  })
})
```

### Checklist de Completitud

#### Database ✓
- [ ] Migración creada y aplicada
- [ ] RLS policies configuradas
- [ ] Triggers de updated_at
- [ ] Índices de performance

#### Backend ✓
- [ ] Types definidos
- [ ] Schemas de validación
- [ ] Route handlers implementados
- [ ] Error handling robusto
- [ ] Tests de integración

#### Frontend ✓
- [ ] Hooks de data fetching
- [ ] Componentes UI
- [ ] Formularios con validación
- [ ] Estados de loading/error
- [ ] Tests de componentes

#### Security ✓
- [ ] Autenticación requerida
- [ ] Autorización por roles
- [ ] Validación de input
- [ ] Sanitización de datos
- [ ] Rate limiting (si necesario)

---

## ⚠️ VALIDATION CHECKLIST

Antes de considerar la tarea completa:

1. **Schema Verification**: ✅ Esquema verificado desde DB local
2. **RLS Testing**: ✅ Políticas probadas con múltiples roles
3. **Multi-tenant Safety**: ✅ Aislamiento de tenants confirmado
4. **Type Safety**: ✅ Sin `any` types, validación completa
5. **Error Handling**: ✅ Manejo de errores en todos los niveles
6. **Performance**: ✅ Queries optimizadas, índices apropiados
7. **Security**: ✅ Autenticación + autorización + validación
8. **Testing**: ✅ Tests unitarios + integración + E2E básico

## Notas Adicionales

- **Rollback Plan**: Documentar cómo revertir cambios si es necesario
- **Performance Impact**: Evaluar impacto en queries existentes
- **Documentation**: Actualizar documentación de API si es público
- **Monitoring**: Agregar logs/métricas si es funcionalidad crítica
