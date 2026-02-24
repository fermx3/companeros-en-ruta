# Frontend Design Skill

## Contexto del Proyecto

Este proyecto es un **SaaS multi-tenant** llamado **Compañeros en Ruta** desarrollado con:

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- Arquitectura **multi-tenant**: `Tenants → Brands → Users/Clients/Zones`

## 🎨 Design System Específico - Compañeros en Ruta

### Paleta de Colores Oficial
```css
:root {
  /* Primarios */
  --primary: 16 82% 54%;      /* Naranja #FF5722 */
  --primary-foreground: 0 0% 100%;

  /* Secundarios */
  --secondary: 207 90% 54%;   /* Azul #2196F3 */
  --accent: 122 39% 49%;      /* Verde #4CAF50 */
  --warning: 45 93% 58%;      /* Amarillo/Oro #FFB300 */

  /* Grises del sistema */
  --background: 0 0% 98%;     /* Fondo principal */
  --card: 0 0% 100%;          /* Fondo de cards */
  --muted: 210 40% 96%;       /* Fondos sutiles */
  --border: 214 32% 91%;      /* Bordes */
}
```

### Typography System
- **Font Family**: Inter, system-ui, sans-serif
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Scales**: text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px), text-3xl (30px)

## Reglas de Diseño Obligatorias

### 1. Componentes Reutilizables PRIMERO

**MANDATORIO**: Antes de crear cualquier UI:

1. **Identificar patrones** repetibles en el diseño
2. **Crear componente base** reutilizable
3. **Implementar variantes** via props
4. **Documentar props interface**
5. **ANTES de crear un componente nuevo**:
   - Buscar componentes existentes con funcionalidad similar usando `grep_search` o `find_by_name`
   - Buscar imports y nombres relacionados en `src/components/`
   - Si existe componente similar:
     - ¿Se puede reutilizar directamente?
     - ¿Se puede extender con props adicionales?
     - ¿Es mejor crear uno nuevo por razones de complejidad?
   - **PREGUNTAR AL USUARIO** si encuentras componentes similares antes de duplicar funcionalidad
   - Documentar la decisión en comentarios JSDoc del código

### 2. Estructura de Archivos

```
src/components/
├── ui/              # shadcn/ui + custom components
│   ├── button.tsx   # Variantes de botones
│   ├── card.tsx     # Cards del sistema
│   ├── badge.tsx    # Status badges
│   └── metric-card.tsx  # Cards de métricas
├── layout/          # Headers, navigation, footers
├── auth/            # Login, register, profile
├── forms/           # Form components con validación
└── [feature]/       # Componentes por funcionalidad
```

### 3. Look & Feel Específico

**Mobile-First Design** con estas características visuales:

- **Cards**: `rounded-2xl` con `shadow-sm`, **SIN border** (solo sombra), padding generoso
- **Buttons**: `rounded-xl` con states hover/active/disabled
- **Spacing**: Sistema 4px base (4, 8, 12, 16, 24, 32, 48)
- **Icons**: Lucide React, tamaño consistente (16px, 20px, 24px)
- **Bottom Navigation**: En móvil con 4-5 tabs principales
- **Tabs**: Estilo pill con fondo naranja para activo, sin bordes inferiores

## 🧩 Componentes Reutilizables Obligatorios

### 1. MetricCard Component
```tsx
interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning'
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  variant = 'default',
  className
}: MetricCardProps) {
  return (
    <Card className={cn(
      "p-6 rounded-2xl border-0 shadow-sm",
      {
        'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground': variant === 'primary',
        'bg-gradient-to-br from-green-500 to-green-600 text-white': variant === 'success',
        'bg-gradient-to-br from-amber-500 to-amber-600 text-white': variant === 'warning'
      },
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-4 w-4" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
```

### 2. StatusBadge Component
```tsx
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const variants = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    expired: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <Badge className={cn(
      'border rounded-full font-medium',
      variants[status],
      sizes[size],
      className
    )}>
      {status.toUpperCase()}
    </Badge>
  )
}
```

### 3. ActionButton Component
```tsx
interface ActionButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  icon?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export function ActionButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  children,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={cn(
        'rounded-xl font-medium transition-all duration-200',
        {
          // Primary - Naranja del sistema
          'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl': variant === 'primary',

          // Secondary - Azul del sistema
          'bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl': variant === 'secondary',

          // Ghost - Para acciones sutiles
          'bg-transparent hover:bg-muted border border-border text-foreground hover:text-foreground': variant === 'ghost',

          // Destructive - Para acciones peligrosas
          'bg-red-500 hover:bg-red-600 text-white': variant === 'destructive',

          // Sizes
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',

          // Full width
          'w-full': fullWidth,

          // Loading state
          'opacity-50 cursor-not-allowed': loading || disabled
        },
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon && <span className="shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
      </div>
    </Button>
  )
}
```

### 4. ProgressCard Component (Para loyalty tiers)
```tsx
interface ProgressCardProps {
  currentTier: string
  nextTier: string
  currentPoints: number
  targetPoints: number
  totalPoints: number
  userId?: string
  className?: string
}

export function ProgressCard({
  currentTier,
  nextTier,
  currentPoints,
  targetPoints,
  totalPoints,
  userId,
  className
}: ProgressCardProps) {
  const progress = (currentPoints / targetPoints) * 100

  return (
    <Card className={cn(
      "p-6 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg",
      className
    )}>
      <div className="space-y-4">
        {/* Header con tier actual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">NIVEL ACTUAL</p>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{currentTier}</h2>
              <Crown className="h-6 w-6" />
            </div>
          </div>
          {userId && (
            <div className="text-right">
              <p className="text-sm opacity-90">ID:</p>
              <p className="font-mono text-sm">{userId}</p>
            </div>
          )}
        </div>

        {/* Progreso a siguiente tier */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso a {nextTier}</span>
            <span>{currentPoints.toLocaleString()} / {targetPoints.toLocaleString()} pts</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Total points */}
        <div>
          <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
          <p className="text-sm opacity-90">puntos totales</p>
        </div>
      </div>
    </Card>
  )
}
```

### 5. QRActionCard Component
```tsx
interface QRActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onAction: () => void
  actionLabel: string
  disabled?: boolean
  className?: string
}

export function QRActionCard({
  title,
  description,
  icon,
  onAction,
  actionLabel,
  disabled,
  className
}: QRActionCardProps) {
  return (
    <Card className={cn(
      "p-4 rounded-2xl border-0 shadow-sm bg-white hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <ActionButton
          variant="primary"
          size="sm"
          onClick={onAction}
          disabled={disabled}
        >
          {actionLabel}
        </ActionButton>
      </div>
    </Card>
  )
}
```

### 6. VisitEvaluationCard Component
```tsx
interface EvaluationItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'completed'
  onPress: () => void
}

interface VisitEvaluationCardProps {
  items: EvaluationItem[]
  pendingCount: number
  className?: string
}

export function VisitEvaluationCard({
  items,
  pendingCount,
  className
}: VisitEvaluationCardProps) {
  return (
    <Card className={cn("p-6 rounded-2xl space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">EVALUACIÓN DE VISITA</h3>
        {pendingCount > 0 && (
          <StatusBadge status="pending" size="sm">
            {pendingCount} Pendientes
          </StatusBadge>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={item.onPress}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        ))}
      </div>
    </Card>
  )
}
```

### 7. Tabs Component
```tsx
interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

// Simple tab navigation with underline indicator
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="activos">
      Activos <span className="ml-1">(3)</span>
    </TabsTrigger>
    <TabsTrigger value="usados">
      Usados
    </TabsTrigger>
  </TabsList>

  <TabsContent value="activos">
    {/* Content for activos tab */}
  </TabsContent>

  <TabsContent value="usados">
    {/* Content for usados tab */}
  </TabsContent>
</Tabs>

// Styling
// - Active tab: border-primary text-primary (naranja)
// - Inactive tab: border-transparent text-muted-foreground
// - Border bottom on TabsList for visual separation
// - Supports count badges in trigger text
```

### 8. Avatar Component
```tsx
interface AvatarProps {
  src?: string | null
  alt: string
  fallback?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

// Circular avatar with fallback
<Avatar
  src={user.avatarUrl}
  alt={user.name}
  size="md"
/>

// With custom fallback icon
<Avatar
  alt="Brand"
  fallback={<Building2 className="h-6 w-6" />}
  size="lg"
/>

// Sizes: sm (h-8 w-8), md (h-12 w-12), lg (h-16 w-16)
// Always rounded-full
// Fallback shows Building2 icon by default
// Supports image error handling (falls back to icon on error)
```

### 9. QRCouponCard Component
```tsx
// Specialized card for displaying QR coupons
// Mobile-first design with brand avatar, status badge, and actions
<QRCouponCard
  code="ABC123XYZ"
  brandName="Mi Marca"
  brandLogoUrl="https://..."
  status="active"
  createdAt="2026-02-01T10:00:00Z"
  description="20% de descuento en tu próxima compra"
  size={180}
/>

// Features:
// - Brand avatar (circular, top left) using Avatar component
// - Status badge (top right): Orange bg for "active"
// - Creation date formatted as "CREADO EL: DD/MM/YYYY"
// - QR code centered with cyan/teal background (bg-cyan-100)
// - Code displayed in large orange text (text-primary text-2xl)
// - Description below QR
// - Two action buttons: "Descargar" and "Copiar" (ghost variant)
// - Download creates PNG with cyan background
// - Copy uses clipboard API
```

### 10. BrandCarousel Component
```tsx
// Horizontal scrollable brand filter with snap-scroll
<BrandCarousel
  brands={[
    { id: '1', name: 'Brand A', logo_url: 'https://...' },
    { id: '2', name: 'Brand B', logo_url: null }
  ]}
  selectedBrandId={selectedId}
  onSelectBrand={setSelectedId}
/>

// Features:
// - Title "MIS CUPONES" in muted-foreground
// - "Todas" option (null selectedBrandId) with menu icon
// - Each brand shown as mini-card with Avatar + name
// - Selected state: border-primary bg-primary/5
// - Horizontal scroll with snap-x snap-mandatory
// - No scrollbar (hidden via CSS)
// - Min width per card: 80px
// - Mobile-optimized with touch scrolling
```

## 📱 Layout y Navigation System

### Mobile-First Dashboard Layout
```tsx
// Layout principal con bottom navigation
function DashboardLayout({
  role,
  children
}: {
  role: UserRole
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header con branding y notificaciones */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-white">CR</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SMART DATA CENTER</p>
              <h1 className="text-lg font-bold">Brand Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 space-y-6">
        {children}
      </main>

      {/* Bottom Navigation - Solo en móvil */}
      <BottomNavigation role={role} />
    </div>
  )
}
```

### Bottom Navigation Component
```tsx
interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/dashboard',
    roles: ['admin', 'brand', 'supervisor', 'promotor', 'asesor_de_ventas', 'client']
  },
  {
    id: 'visits',
    label: 'Visitas',
    icon: <MapPin className="h-5 w-5" />,
    href: '/visits',
    roles: ['promotor', 'asesor_de_ventas', 'supervisor']
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: <Users className="h-5 w-5" />,
    href: '/clients',
    roles: ['brand', 'supervisor', 'promotor']
  },
  {
    id: 'loyalty',
    label: 'Lealtad',
    icon: <Star className="h-5 w-5" />,
    href: '/loyalty',
    roles: ['client']
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/reports',
    roles: ['admin', 'brand', 'supervisor']
  },
  {
    id: 'settings',
    label: 'Ajustes',
    icon: <Settings className="h-5 w-5" />,
    href: '/settings',
    roles: ['admin', 'brand', 'supervisor', 'promotor', 'asesor_de_ventas', 'client']
  }
]

export function BottomNavigation({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const allowedItems = navItems.filter(item => item.roles.includes(role))

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden">
      <div className="grid grid-cols-4 md:grid-cols-5">
        {allowedItems.slice(0, 4).map(item => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

### Request/Approval Card Pattern
```tsx
interface RequestCardProps {
  id: string
  title: string
  description: string
  type: 'campaign' | 'promotion' | 'visit'
  timeAgo: string
  status: 'pending' | 'approved' | 'rejected'
  onApprove: () => void
  onReject: () => void
  className?: string
}

export function RequestCard({
  title,
  description,
  type,
  timeAgo,
  status,
  onApprove,
  onReject,
  className
}: RequestCardProps) {
  const icons = {
    campaign: <Tag className="h-5 w-5" />,
    promotion: <Percent className="h-5 w-5" />,
    visit: <MapPin className="h-5 w-5" />
  }

  return (
    <Card className={cn("p-4 rounded-2xl space-y-4", className)}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
          {icons[type]}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <StatusBadge status={status} size="sm" />
          </div>
        </div>
      </div>

      {status === 'pending' && (
        <div className="flex gap-2">
          <ActionButton
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onReject}
          >
            Rechazar
          </ActionButton>
          <ActionButton
            variant="primary"
            size="sm"
            fullWidth
            onClick={onApprove}
          >
            Aprobar
          </ActionButton>
        </div>
      )}
    </Card>
  )
}
```

### Dashboard Metrics Grid
```tsx
interface DashboardMetricsProps {
  metrics: Array<{
    title: string
    value: string | number
    change?: string
    trend?: 'up' | 'down' | 'neutral'
    variant?: 'default' | 'primary' | 'success' | 'warning'
  }>
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}
```

## 🎯 Estado y Datos

- **React Hook Form** + **Zod** para formularios
- **SWR/TanStack Query** para cache de datos
- **Zustand** para estado global (si necesario)
- **Context Providers**: solo para datos de tenant/brand

### Contexto de Marca
Cada brand tiene sus proprios colores y configuración visual:

```typescript
interface BrandTheme {
  primary_color: string
  secondary_color: string
  logo_url: string | null
  settings: Record<string, unknown>
}
```

### Roles de Usuario y Permisos UI

```typescript
type UserRole = 'admin' | 'brand' | 'supervisor' | 'promotor' | 'asesor_de_ventas' | 'market_analyst' | 'client'
```

**Dashboards por rol:**
- `admin`: Gestión de tenants, brands, usuarios
- `brand`: Analytics de marca, clientes, promotions
- `supervisor`: Gestión de equipos, territories
- `promotor`: Visitas, clientes asignados
- `asesor_de_ventas`: Ventas externas, distributors
- `client`: QR codes, loyalty points, orders

### Layout Responsive

```tsx
// Layout principal con sidebar condicional
function DashboardLayout({ role }: { role: UserRole }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="lg:pl-64">
        <Header />
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

## Componentes Críticos del Proyecto

### 1. Autenticación
- Login multi-tenant con email + tenant selection
- Password reset + email verification
- Role-based redirects

### 2. Dashboard Analytics
- Métricas en cards con `recharts`
- Tablas de datos con `@tanstack/react-table`
- Filtros de fecha con `date-fns`

### 3. Gestión de Clientes
- CRUD completo con formularios
- Búsqueda + filtros por zona/tipo
- Bulk operations

### 4. Sistema QR
- Generación de QR codes para promotions
- Scanner móvil con cámara
- Estados: active, redeemed, expired

### 5. Visitas y Órdenes
- Formularios de visita con geolocalización
- Tracking de productos y stock
- Workflow: planned → in_progress → completed

## Patrones de Implementación

### Formularios Tipesafe
```tsx
const clientSchema = z.object({
  business_name: z.string().min(1),
  owner_name: z.string().min(1),
  email: z.string().email().optional(),
  zone_id: z.string().uuid()
})

function ClientForm() {
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema)
  })

  return (
    <Form {...form}>
      {/* campos con validación automática */}
    </Form>
  )
}
```

### Data Tables con RLS
```tsx
function ClientsTable({ brandId }: { brandId: string }) {
  const { data: clients } = useSWR(
    ['clients', brandId],
    () => fetchClientsForBrand(brandId)
  )

  return (
    <DataTable
      columns={clientColumns}
      data={clients || []}
      filterBy="business_name"
    />
  )
}
```

### Error Boundaries
```tsx
function ErrorFallback({ error }: { error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}
```

## 🔐 Authentication & Forms Específicos

### Login Form Pattern
```tsx
export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header con branding */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-white">CR</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">Compañeros</h1>
            <span className="text-sm font-medium text-primary">EN RUTA</span>
          </div>
        </div>

        {/* Heading principal */}
        <div className="space-y-3 mb-8">
          <h2 className="text-3xl font-bold leading-tight">
            Centraliza tu <span className="text-primary">información</span> comercial.
          </h2>
          <p className="text-muted-foreground">
            Gestiona marcas, ventas y puntos de venta en un solo ecosistema inteligente.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded-t-3xl p-6 space-y-6">
        <h3 className="text-xl font-semibold">Iniciar Sesión</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="nombre@empresa.com"
                        className="pl-10 h-12 rounded-xl"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 rounded-xl"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ActionButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={form.formState.isSubmitting}
            >
              Ingresar al Panel
            </ActionButton>
          </form>
        </Form>

        {/* Social login */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">O ACCEDE CON</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ActionButton variant="ghost" className="border">
              Google
            </ActionButton>
            <ActionButton variant="ghost" className="border">
              Apple ID
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### QR Scanner Interface
```tsx
interface QRScannerProps {
  onScanSuccess: (data: string) => void
  onClose: () => void
  title?: string
}

export function QRScanner({ onScanSuccess, onClose, title = "Escanear QR de Entrada" }: QRScannerProps) {
  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="relative z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="w-10" />
        </div>
      </div>

      {/* Scanner area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-64 h-64 border-2 border-white rounded-2xl relative overflow-hidden">
            {/* Esquinas del scanner */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-lg" />

            {/* Línea de escaneo animada */}
            <div className="absolute inset-x-4 top-1/2 h-0.5 bg-primary shadow-lg shadow-primary/50 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="text-center text-white space-y-2">
          <p className="text-lg font-semibold">Posiciona el código QR dentro del marco</p>
          <p className="text-sm opacity-80">El escaneo será automático</p>
        </div>
      </div>
    </div>
  )
}
```

## 🎯 Patrones de Estado y Datos

- **React Hook Form** + **Zod** para formularios
- **SWR/TanStack Query** para cache de datos
- **Zustand** para estado global (si necesario)
- **Context Providers**: solo para datos de tenant/brand

### Contexto de Marca Dinámico
```typescript
interface BrandTheme {
  primary_color: string
  secondary_color: string
  logo_url: string | null
  settings: Record<string, unknown>
}

// Hook para aplicar tema dinámico
export function useBrandTheme(brandId: string) {
  const [theme, setTheme] = useState<BrandTheme | null>(null)

  useEffect(() => {
    fetchBrandTheme(brandId).then(setTheme)
  }, [brandId])

  useEffect(() => {
    if (theme?.primary_color) {
      // Aplicar CSS variables dinámicamente
      document.documentElement.style.setProperty('--primary', theme.primary_color)
    }
  }, [theme])

  return theme
}
```

## 🏗️ Implementación de Componentes Específicos

### REGLAS OBLIGATORIAS:

1. **SIEMPRE** crear el componente base reutilizable primero
2. **IDENTIFICAR** todas las variantes posibles (size, variant, state)
3. **DOCUMENTAR** las props interface con TypeScript estricto
4. **IMPLEMENTAR** estados loading/error/empty donde aplique
5. **ASEGURAR** accesibilidad completa (aria-*, focus, keyboard)

### Checklist de Componente Completo:
- [ ] Interface TypeScript definida
- [ ] Variantes via props (size, variant, disabled, etc.)
- [ ] Estados de loading/error manejados
- [ ] Responsive design (mobile-first)
- [ ] Accesibilidad implementada
- [ ] Documentación básica en comentarios
- [ ] Testeable con React Testing Library

- **Jest** + **React Testing Library** para unit tests
- **Playwright** para E2E tests
- **Storybook** para component showcase (opcional)
- **Visual regression** con Chromatic (si disponible)

## Performance

- **Next.js Image** para optimización de imágenes
- **Dynamic imports** para code splitting
- **React.memo** para componentes costosos
- **Virtualization** para listas largas (`@tanstack/react-virtual`)

## Accesibilidad (A11y)

- **Focus management** en modals y forms
- **Screen reader** support con aria-labels
- **Keyboard navigation** completa
- **Color contrast** WCAG AA compliance

## Mobile-First Considerations

- **Touch targets**: mínimo 44px x 44px
- **Gestures**: swipe para actions, pull-to-refresh
- **Performance**: lazy loading, optimistic UI
- **Network**: offline status, retry logic

---

## ⚠️ REGLAS CRÍTICAS - COMPAÑEROS EN RUTA

### 🧩 COMPONENTES REUTILIZABLES (OBLIGATORIO)

1. **NUNCA** crear UI inline - SIEMPRE componente reutilizable primero
2. **IDENTIFICAR** patrones repetitivos antes de implementar
3. **CREAR** variantes via props (no duplicar código)
4. **DOCUMENTAR** cada prop en la interface TypeScript
5. **IMPLEMENTAR** todos los estados: loading, error, empty, disabled

### 🎨 LOOK & FEEL ESPECÍFICO

1. **USAR** exclusivamente la paleta naranja-azul definida
2. **APLICAR** rounded-2xl en cards principales, rounded-xl en botones
3. **MANTENER** espaciado consistente (sistema 4px base)
4. **IMPLEMENTAR** shadows sutiles (shadow-sm, shadow-lg)
5. **SEGUIR** patrones de la navegación inferior móvil

### 🔒 SEGURIDAD Y PERMISOS UI

1. **VERIFICAR** permisos antes de renderizar componentes sensibles
2. **OCULTAR** funcionalidad no disponible por rol/permisos
3. **MOSTRAR** estados de "sin acceso" cuando corresponda
4. **VALIDAR** inputs con Zod SIEMPRE
5. **MANEJAR** errores de autorización gracefully

### 📱 MOBILE-FIRST MANDATORIO

1. **DISEÑAR** para móvil primero (320px+)
2. **PROBAR** en dispositivos reales, no solo navegador
3. **IMPLEMENTAR** touch targets mínimo 44px x 44px
4. **USAR** bottom navigation en móvil
5. **OPTIMIZAR** para gestos touch (swipe, tap, long press)

### 🚀 PERFORMANCE Y UX

1. **LAZY LOAD** componentes pesados (charts, tablas grandes)
2. **IMPLEMENTAR** skeleton loading states
3. **DEBOUNCE** inputs de búsqueda (300ms mínimo)
4. **CACHEAR** datos con SWR/TanStack Query
5. **MOSTRAR** feedback inmediato en todas las acciones

### 🧪 TESTING UI REQUERIDO

1. **UNIT TESTS**: Todos los componentes reutilizables
2. **INTEGRATION TESTS**: Flows completos (login, dashboard)
3. **E2E TESTS**: User journeys críticos por rol
4. **ACCESSIBILITY TESTS**: axe-core en componentes principales
5. **VISUAL REGRESSION**: Screenshots de componentes claves

## Ejemplo de Implementación Completa

```tsx
// ✅ CORRECTO: Componente reutilizable completo
interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'primary' | 'success' | 'warning'
  loading?: boolean
  error?: string | null
  className?: string
}

export function MetricCard(props: MetricCardProps) {
  // Manejar todos los estados
  if (props.loading) return <MetricCardSkeleton />
  if (props.error) return <MetricCardError error={props.error} />

  return (
    <Card className={cn(
      "p-6 rounded-2xl border-0 shadow-sm transition-all duration-200 hover:shadow-md",
      {
        'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground': props.variant === 'primary'
      },
      props.className
    )}>
      {/* Implementación completa... */}
    </Card>
  )
}

// ❌ INCORRECTO: UI inline, no reutilizable
function Dashboard() {
  return (
    <div className="p-6 rounded-2xl bg-blue-500">
      <h2>Ventas Totales</h2>
      <p>$124.5k</p>
    </div>
  )
}
```
