'use client'

import { useState } from 'react'
import { Package, Search, Bell, Gift, Calendar, Target, FileText, Monitor, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { OrderStatusBadge } from '@/components/ui/order-status-badge'
import { VisitStatusBadge } from '@/components/ui/visit-status-badge'
import {
  LoadingSpinner,
  Alert,
} from '@/components/ui/feedback'
import { EmptyState } from '@/components/ui/EmptyState'
import { WizardStepper } from '@/components/ui/wizard-stepper'
import { Avatar } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sections = [
  { id: 'colors', label: 'Colores' },
  { id: 'typography', label: 'Tipografía' },
  { id: 'spacing', label: 'Espaciado y Radio' },
  { id: 'buttons', label: 'Botones' },
  { id: 'forms', label: 'Formularios' },
  { id: 'cards', label: 'Cards' },
  { id: 'badges', label: 'Badges y Status' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'wizards', label: 'Wizards' },
]

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Swatch({ name, cssVar, description }: { name: string; cssVar: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 w-28">
      <div
        className="h-16 w-16 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="text-xs font-medium text-center">{name}</span>
      <code className="text-[10px] text-muted-foreground">{cssVar}</code>
      {description && (
        <p className="text-[10px] text-muted-foreground text-center leading-tight">{description}</p>
      )}
    </div>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  )
}

function ViewportPreview({ children }: { children: (layout: 'desktop' | 'mobile') => React.ReactNode }) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setViewport('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewport === 'desktop'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Desktop
        </button>
        <button
          type="button"
          onClick={() => setViewport('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewport === 'mobile'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile
        </button>
      </div>
      <div
        className={`border border-border rounded-lg overflow-hidden transition-all ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'w-full'
        }`}
      >
        {children(viewport)}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DesignGuidePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [phoneValue, setPhoneValue] = useState('5512345678')
  const [activeTab, setActiveTab] = useState('tab1')

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar — desktop */}
      <nav className="hidden lg:block w-56 shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto p-4">
        <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Design Guide
        </h1>
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded-md px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-16">
        {/* Mobile nav */}
        <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* ================================================================
            1. COLORES
        ================================================================ */}
        <Section id="colors" title="Colores" description="Tokens de color del sistema de diseño.">
          <SubSection title="Marca">
            <div className="flex flex-wrap gap-6">
              <Swatch name="Primary" cssVar="--color-primary" description="Botones principales, links, iconos activos, nav seleccionado" />
              <Swatch name="Primary FG" cssVar="--color-primary-foreground" description="Texto sobre fondo primary (botones, badges)" />
              <Swatch name="Secondary" cssVar="--color-secondary" description="Botones secundarios, badges informativos, acentos alternativos" />
              <Swatch name="Secondary FG" cssVar="--color-secondary-foreground" description="Texto sobre fondo secondary" />
              <Swatch name="Accent" cssVar="--color-accent" description="Indicadores de éxito, checks, estados positivos" />
              <Swatch name="Accent FG" cssVar="--color-accent-foreground" description="Texto sobre fondo accent" />
            </div>
          </SubSection>

          <SubSection title="Semánticos">
            <div className="flex flex-wrap gap-6">
              <Swatch name="Warning" cssVar="--color-warning" description="Alertas, estados pendientes, acciones que requieren atención" />
              <Swatch name="Destructive" cssVar="--color-destructive" description="Errores, eliminaciones, estados críticos, botones peligrosos" />
              <Swatch name="Destructive FG" cssVar="--color-destructive-foreground" description="Texto sobre fondo destructive" />
            </div>
          </SubSection>

          <SubSection title="Superficies">
            <div className="flex flex-wrap gap-6">
              <Swatch name="Background" cssVar="--color-background" description="Fondo general de la app" />
              <Swatch name="Foreground" cssVar="--color-foreground" description="Texto principal, títulos, contenido" />
              <Swatch name="Card" cssVar="--color-card" description="Fondo de cards, modals, popovers" />
              <Swatch name="Card FG" cssVar="--color-card-foreground" description="Texto dentro de cards" />
              <Swatch name="Muted" cssVar="--color-muted" description="Fondos sutiles, hover states, secciones secundarias" />
              <Swatch name="Muted FG" cssVar="--color-muted-foreground" description="Texto secundario, labels, placeholders, descripciones" />
              <Swatch name="Border" cssVar="--color-border" description="Bordes de cards, separadores, dividers" />
              <Swatch name="Input" cssVar="--color-input" description="Borde de inputs, selects, textareas" />
              <Swatch name="Ring" cssVar="--color-ring" description="Anillo de focus en elementos interactivos" />
            </div>
          </SubSection>
        </Section>

        {/* ================================================================
            2. TIPOGRAFÍA
        ================================================================ */}
        <Section id="typography" title="Tipografía" description="Escala tipográfica con Inter.">
          <div className="space-y-4">
            {(
              [
                ['text-3xl', '1.875rem'],
                ['text-2xl', '1.5rem'],
                ['text-xl', '1.25rem'],
                ['text-lg', '1.125rem'],
                ['text-base', '1rem'],
                ['text-sm', '0.875rem'],
                ['text-xs', '0.75rem'],
              ] as const
            ).map(([cls, size]) => (
              <div key={cls} className="flex items-baseline gap-4">
                <code className="text-xs text-muted-foreground w-20 shrink-0">{cls}</code>
                <span className={cls}>
                  Compañeros en Ruta <span className="text-muted-foreground">({size})</span>
                </span>
              </div>
            ))}
          </div>

          <SubSection title="Pesos">
            <div className="space-y-2 text-lg">
              {(
                [
                  ['font-normal', '400'],
                  ['font-medium', '500'],
                  ['font-semibold', '600'],
                  ['font-bold', '700'],
                ] as const
              ).map(([cls, w]) => (
                <div key={cls} className="flex items-baseline gap-4">
                  <code className="text-xs text-muted-foreground w-28 shrink-0">{cls}</code>
                  <span className={cls}>Texto de ejemplo — weight {w}</span>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* ================================================================
            3. ESPACIADO Y RADIO
        ================================================================ */}
        <Section id="spacing" title="Espaciado y Radio" description="Tokens de espaciado y border-radius.">
          <SubSection title="Espaciado (base 4px)">
            <div className="flex flex-wrap items-end gap-4">
              {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="bg-primary"
                    style={{ width: `${n * 4}px`, height: `${n * 4}px` }}
                  />
                  <code className="text-[10px] text-muted-foreground">{n}</code>
                  <span className="text-[10px] text-muted-foreground">{n * 4}px</span>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Border Radius">
            <div className="flex flex-wrap gap-6">
              {(
                [
                  ['sm', '8px', 'rounded-sm'],
                  ['md', '12px', 'rounded-md'],
                  ['lg', '16px', 'rounded-lg'],
                  ['xl', '24px', 'rounded-xl'],
                  ['full', '9999px', 'rounded-full'],
                ] as const
              ).map(([name, px, cls]) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <div className={`h-16 w-16 bg-primary ${cls}`} />
                  <code className="text-xs text-muted-foreground">{name}</code>
                  <span className="text-[10px] text-muted-foreground">{px}</span>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* ================================================================
            4. BOTONES
        ================================================================ */}
        <Section id="buttons" title="Botones" description="Button y ActionButton con todas sus variantes.">
          <SubSection title="Button — Variantes">
            <div className="flex flex-wrap gap-3">
              {(['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive'] as const).map(
                (v) => (
                  <Button key={v} variant={v}>
                    {v}
                  </Button>
                )
              )}
            </div>
          </SubSection>

          <SubSection title="Button — Tamaños">
            <div className="flex flex-wrap items-center gap-3">
              {(['sm', 'default', 'lg'] as const).map((s) => (
                <Button key={s} size={s}>
                  {s}
                </Button>
              ))}
              <Button size="icon" aria-label="Buscar">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </SubSection>

          <SubSection title="ActionButton — Variantes">
            <div className="flex flex-wrap gap-3">
              {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((v) => (
                <ActionButton key={v} variant={v} icon={<Package className="h-4 w-4" />}>
                  {v}
                </ActionButton>
              ))}
            </div>
          </SubSection>

          <SubSection title="ActionButton — Estados">
            <div className="flex flex-wrap gap-3">
              <ActionButton variant="primary">Normal</ActionButton>
              <ActionButton variant="primary" loading>
                Loading
              </ActionButton>
              <ActionButton variant="primary" disabled>
                Disabled
              </ActionButton>
              <ActionButton variant="primary" fullWidth>
                Full Width
              </ActionButton>
            </div>
          </SubSection>
        </Section>

        {/* ================================================================
            5. FORMULARIOS
        ================================================================ */}
        <Section id="forms" title="Controles de Formulario" description="Inputs, selects y otros controles.">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="demo-input">Input</Label>
              <Input id="demo-input" placeholder="Placeholder..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-input-disabled">Input disabled</Label>
              <Input id="demo-input-disabled" placeholder="Disabled" disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-textarea">Textarea</Label>
              <Textarea id="demo-textarea" placeholder="Escribe algo..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-select">Select</Label>
              <Select id="demo-select" defaultValue="">
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="1">Opción 1</option>
                <option value="2">Opción 2</option>
                <option value="3">Opción 3</option>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="demo-checkbox"
                  checked={checkboxChecked}
                  onCheckedChange={setCheckboxChecked}
                />
                <Label htmlFor="demo-checkbox">Checkbox — {checkboxChecked ? 'checked' : 'unchecked'}</Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} />
                <Label>Switch — {switchChecked ? 'on' : 'off'}</Label>
              </div>
            </div>

            <div className="space-y-2">
              <PhoneInput
                label="Teléfono"
                value={phoneValue}
                onChange={setPhoneValue}
              />
            </div>
          </div>

          <SubSection title="Label con required">
            <Label required>Campo obligatorio</Label>
          </SubSection>
        </Section>

        {/* ================================================================
            6. CARDS
        ================================================================ */}
        <Section id="cards" title="Cards" description="Card básico y MetricCard.">
          <SubSection title="Card básico">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Título de la Card</CardTitle>
                <CardDescription>Descripción o subtítulo de la card.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contenido de ejemplo dentro de la card. Puede incluir texto, formularios, listas,
                  etc.
                </p>
              </CardContent>
            </Card>
          </SubSection>

          <SubSection title="MetricCard — Variantes">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Default" value="1,234" change="+12%" trend="up" />
              <MetricCard
                title="Primary"
                value="567"
                change="+5%"
                trend="up"
                variant="primary"
              />
              <MetricCard
                title="Success"
                value="89%"
                change="+2.3%"
                trend="up"
                variant="success"
              />
              <MetricCard
                title="Warning"
                value="23"
                change="-8%"
                trend="down"
                variant="warning"
              />
            </div>
          </SubSection>

          <SubSection title="MetricCard — Estados">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard title="Neutral trend" value="100" change="0%" trend="neutral" />
              <MetricCard title="Loading" value="" loading />
              <MetricCard title="Error" value="" error="No se pudo cargar" />
            </div>
          </SubSection>
        </Section>

        {/* ================================================================
            7. BADGES Y STATUS
        ================================================================ */}
        <Section id="badges" title="Badges y Status" description="StatusBadge canónico y Avatar.">
          <SubSection title="StatusBadge (status-badge.tsx)">
            <div className="space-y-3">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <div key={size} className="flex flex-wrap items-center gap-2">
                  <code className="text-xs text-muted-foreground w-8">{size}</code>
                  {(['active', 'inactive', 'suspended', 'pending', 'completed', 'cancelled', 'expired'] as const).map(
                    (status) => (
                      <StatusBadge key={status} status={status} size={size} />
                    )
                  )}
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="OrderStatusBadge (order-status-badge.tsx)">
            <div className="flex flex-wrap items-center gap-2">
              {(['draft', 'submitted', 'confirmed', 'processing', 'processed', 'shipped', 'delivered', 'completed', 'cancelled'] as const).map(
                (status) => (
                  <OrderStatusBadge key={status} status={status} />
                )
              )}
            </div>
          </SubSection>

          <SubSection title="VisitStatusBadge (visit-status-badge.tsx)">
            <div className="flex flex-wrap items-center gap-2">
              {(['planned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'missed', 'no_show'] as const).map(
                (status) => (
                  <VisitStatusBadge key={status} status={status} />
                )
              )}
            </div>
          </SubSection>

          <SubSection title="Avatar">
            <div className="flex items-end gap-4">
              <div className="flex flex-col items-center gap-1">
                <Avatar alt="Small" size="sm" />
                <code className="text-[10px] text-muted-foreground">sm</code>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Avatar alt="Medium" size="md" />
                <code className="text-[10px] text-muted-foreground">md</code>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Avatar alt="Large" size="lg" />
                <code className="text-[10px] text-muted-foreground">lg</code>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Avatar
                  alt="Con imagen"
                  size="lg"
                  src="https://api.dicebear.com/9.x/initials/svg?seed=CR"
                />
                <code className="text-[10px] text-muted-foreground">con imagen</code>
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ================================================================
            8. FEEDBACK
        ================================================================ */}
        <Section id="feedback" title="Feedback" description="Alertas, spinners y estados vacíos.">
          <SubSection title="Alert">
            <div className="space-y-3 max-w-lg">
              {(['success', 'warning', 'error', 'info'] as const).map((v) => (
                <Alert key={v} variant={v} title={`Alert ${v}`}>
                  Este es un mensaje de tipo <strong>{v}</strong>.
                </Alert>
              ))}
              <Alert variant="info" title="Con botón de cerrar" onClose={() => {}}>
                Esta alerta tiene un botón de cierre.
              </Alert>
              <Alert variant="warning">Alerta sin título, solo contenido.</Alert>
            </div>
          </SubSection>

          <SubSection title="LoadingSpinner">
            <div className="flex items-end gap-6">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <LoadingSpinner size={size} />
                  <code className="text-[10px] text-muted-foreground">{size}</code>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="EmptyState">
            <EmptyState
              icon={<Package className="h-12 w-12 text-muted-foreground" />}
              title="No hay elementos"
              description="Aún no se han registrado elementos. Crea uno nuevo para comenzar."
              action={<Button variant="primary">Crear elemento</Button>}
            />
          </SubSection>
        </Section>

        {/* ================================================================
            9. OVERLAYS
        ================================================================ */}
        <Section id="overlays" title="Overlays" description="Dialog y Tabs.">
          <SubSection title="Dialog">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Abrir Dialog
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Título del Dialog</DialogTitle>
                  <DialogDescription>
                    Descripción o instrucciones del dialog. Este es un ejemplo funcional.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input placeholder="Campo de ejemplo..." />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={() => setDialogOpen(false)}>
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SubSection>

          <SubSection title="Tabs">
            <Card className="max-w-lg">
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="tab1">General</TabsTrigger>
                    <TabsTrigger value="tab2">Detalles</TabsTrigger>
                    <TabsTrigger value="tab3">Configuración</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1">
                    <p className="text-sm text-muted-foreground pt-4">
                      Contenido de la pestaña General.
                    </p>
                  </TabsContent>
                  <TabsContent value="tab2">
                    <p className="text-sm text-muted-foreground pt-4">
                      Contenido de la pestaña Detalles.
                    </p>
                  </TabsContent>
                  <TabsContent value="tab3">
                    <p className="text-sm text-muted-foreground pt-4">
                      Contenido de la pestaña Configuración.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </SubSection>

          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <strong>Nota:</strong> Los componentes <code>ImageUpload</code>,{' '}
            <code>ExportButton</code>, <code>ProgressCard</code>, <code>KpiGaugeCard</code> y otros
            componentes de dominio no se incluyen aquí porque requieren contexto de autenticación o
            handlers especializados.
          </div>
        </Section>

        {/* ----------------------------------------------------------------- */}
        {/* Wizards                                                           */}
        {/* ----------------------------------------------------------------- */}
        <Section id="wizards" title="Wizards" description="Indicadores de progreso multi-paso para flujos tipo wizard. Usa el toggle para ver la versión desktop y mobile.">
          <SubSection title="WizardStepper — Con números (default)">
            <ViewportPreview>
              {(layout) => (
                <WizardStepper
                  layout={layout}
                  steps={[
                    { id: 'step1', label: 'Precios y Categoría', shortLabel: 'Precios' },
                    { id: 'step2', label: 'Compra e Inventario', shortLabel: 'Compra' },
                    { id: 'step3', label: 'Comunicación y POP', shortLabel: 'POP' },
                  ]}
                  currentStep={1}
                  completedSteps={new Set([0])}
                  onStepClick={() => {}}
                />
              )}
            </ViewportPreview>
          </SubSection>

          <SubSection title="WizardStepper — Con iconos custom">
            <ViewportPreview>
              {(layout) => (
                <WizardStepper
                  layout={layout}
                  steps={[
                    { id: 'basic', label: 'Información Básica', icon: <Gift className="w-4 h-4" /> },
                    { id: 'duration', label: 'Vigencia', icon: <Calendar className="w-4 h-4" /> },
                    { id: 'options', label: 'Opciones', icon: <Target className="w-4 h-4" /> },
                    { id: 'review', label: 'Revisión', icon: <FileText className="w-4 h-4" /> },
                  ]}
                  currentStep={2}
                  onStepClick={() => {}}
                />
              )}
            </ViewportPreview>
          </SubSection>

          <SubSection title="WizardStepper — Con warning y saving">
            <ViewportPreview>
              {(layout) => (
                <WizardStepper
                  layout={layout}
                  steps={[
                    { id: 'step1', label: 'Precios y Categoría', shortLabel: 'Precios' },
                    { id: 'step2', label: 'Compra e Inventario', shortLabel: 'Compra' },
                    { id: 'step3', label: 'Comunicación y POP', shortLabel: 'POP' },
                  ]}
                  currentStep={2}
                  completedSteps={new Set([0, 1])}
                  warningSteps={new Set([0])}
                  savingStep={2}
                  onStepClick={() => {}}
                />
              )}
            </ViewportPreview>
          </SubSection>
        </Section>
      </main>
    </div>
  )
}
