import type { ComponentType } from 'react'
import {
  Home,
  Users,
  Package,
  UsersRound,
  Tag,
  Layers,
  BarChart3,
  ClipboardList,
  Settings,
  MapPin,
  Calendar,
  ShoppingCart,
  QrCode,
  History,
  Star,
  Building2,
  Truck,
  Eye,
  UserCircle,
  Download,
  LayoutGrid,
  Megaphone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  IconInicio,
  IconVisitas,
  IconClientes,
  IconAgenda,
  IconMas,
  IconQR,
  IconPedidos,
  IconMarcas,
} from '@/components/icons'

export type NavIconComponent = LucideIcon | ComponentType<{ className?: string }>

export interface NavItem {
  id: string
  label: string
  icon: NavIconComponent
  href: string
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export type NavEntry = NavItem | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

export function flattenEntries(entries: NavEntry[]): NavItem[] {
  return entries.flatMap(e => isNavGroup(e) ? e.items : [e])
}

export interface RoleNavConfig {
  role: string
  title: string
  entries: NavEntry[]
  /** @deprecated Use entries + flattenEntries() instead */
  items: NavItem[]
}

function buildConfig(role: string, title: string, entries: NavEntry[]): RoleNavConfig {
  return {
    role,
    title,
    entries,
    get items() {
      return flattenEntries(this.entries)
    },
  }
}

export const brandNavConfig: RoleNavConfig = buildConfig(
  'brand_manager',
  'Brand Manager',
  [
    { id: 'home', label: 'Inicio', icon: Home, href: '/brand' },
    { id: 'kpis', label: 'KPIs', icon: BarChart3, href: '/brand/kpis' },
    {
      id: 'group-comercial',
      label: 'Comercial',
      items: [
        { id: 'clients', label: 'Clientes', icon: Users, href: '/brand/clients' },
        { id: 'products', label: 'Productos', icon: Package, href: '/brand/products' },
        { id: 'orders', label: 'Ordenes', icon: ShoppingCart, href: '/brand/orders' },
        { id: 'promotions', label: 'Promociones', icon: Tag, href: '/brand/promotions' },
        { id: 'tiers', label: 'Niveles', icon: Layers, href: '/brand/tiers' },
      ],
    },
    {
      id: 'group-operaciones',
      label: 'Operaciones',
      items: [
        { id: 'team', label: 'Equipo', icon: UsersRound, href: '/brand/team' },
        { id: 'visits', label: 'Visitas', icon: MapPin, href: '/brand/visits' },
        { id: 'competitors', label: 'Competidores', icon: Building2, href: '/brand/competitors' },
        { id: 'pop-materials', label: 'Materiales POP', icon: LayoutGrid, href: '/brand/pop-materials' },
        { id: 'exhibitions', label: 'Exhibiciones', icon: Eye, href: '/brand/exhibitions' },
        { id: 'communication-plans', label: 'Planes Comunicación', icon: Megaphone, href: '/brand/communication-plans' },
        { id: 'assessment-config', label: 'Config Assessment', icon: ClipboardList, href: '/brand/assessment-config' },
      ],
    },
    {
      id: 'group-reportes',
      label: 'Reportes',
      items: [
        { id: 'reports', label: 'Reportes', icon: BarChart3, href: '/brand/reports' },
        { id: 'exports', label: 'Exportar Datos', icon: Download, href: '/brand/exports' },
      ],
    },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/brand/surveys' },
    {
      id: 'group-config',
      label: 'Configuración',
      items: [
        { id: 'settings', label: 'Configuración', icon: Settings, href: '/brand/settings' },
      ],
    },
  ],
)

export const promotorNavConfig: RoleNavConfig = buildConfig(
  'promotor',
  'Promotor',
  [
    { id: 'home', label: 'Inicio', icon: IconInicio, href: '/promotor' },
    { id: 'visits', label: 'Visitas', icon: IconVisitas, href: '/promotor/visitas' },
    { id: 'clients', label: 'Clientes', icon: IconClientes, href: '/promotor/clients' },
    { id: 'campaigns', label: 'Campañas', icon: Megaphone, href: '/promotor/campanias' },
    { id: 'schedule', label: 'Agenda', icon: IconAgenda, href: '/promotor/schedule' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/promotor/surveys' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, href: '/promotor/reports' },
  ],
)

export const asesorVentasNavConfig: RoleNavConfig = buildConfig(
  'asesor_de_ventas',
  'Asesor de Ventas',
  [
    { id: 'home', label: 'Inicio', icon: Home, href: '/asesor-ventas' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/asesor-ventas/clients' },
    { id: 'orders', label: 'Órdenes', icon: ShoppingCart, href: '/asesor-ventas/orders' },
    { id: 'deliver-qr', label: 'Entregar QR', icon: QrCode, href: '/asesor-ventas/entregar-promocion' },
    { id: 'qr-history', label: 'Historial QR', icon: History, href: '/asesor-ventas/historial-qr' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/asesor-ventas/surveys' },
  ],
)

export const clientNavConfig: RoleNavConfig = buildConfig(
  'client',
  'Mi Portal',
  [
    { id: 'home', label: 'Inicio', icon: IconInicio, href: '/client' },
    { id: 'qr', label: 'Mi QR', icon: IconQR, href: '/client/qr' },
    { id: 'orders', label: 'Pedidos', icon: IconPedidos, href: '/client/orders' },
    { id: 'brands', label: 'Marcas', icon: IconMarcas, href: '/client/brands' },
    { id: 'points', label: 'Puntos', icon: Star, href: '/client/points' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/client/surveys' },
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle, href: '/client/profile' },
  ],
)

export const adminNavConfig: RoleNavConfig = buildConfig(
  'admin',
  'Administración',
  [
    { id: 'home', label: 'Inicio', icon: Home, href: '/admin' },
    { id: 'brands', label: 'Marcas', icon: Building2, href: '/admin/brands' },
    { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
    { id: 'clients', label: 'Clientes', icon: UsersRound, href: '/admin/clients' },
    { id: 'zones', label: 'Zonas', icon: MapPin, href: '/admin/zones' },
    { id: 'visits', label: 'Visitas', icon: Eye, href: '/admin/visits' },
    { id: 'orders', label: 'Ordenes', icon: ShoppingCart, href: '/admin/orders' },
    { id: 'promotions', label: 'Promociones', icon: Tag, href: '/admin/promotions' },
    { id: 'kpi-definitions', label: 'Definiciones KPI', icon: BarChart3, href: '/admin/kpi-definitions' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/admin/surveys' },
    { id: 'distributors', label: 'Distribuidores', icon: Truck, href: '/admin/distributors' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/admin/settings' },
  ],
)

export const supervisorNavConfig: RoleNavConfig = buildConfig(
  'supervisor',
  'Supervisor',
  [
    { id: 'home', label: 'Inicio', icon: Home, href: '/supervisor' },
    { id: 'team', label: 'Equipo', icon: UsersRound, href: '/supervisor/team' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/supervisor/clients' },
    { id: 'visits', label: 'Visitas', icon: Eye, href: '/supervisor/visits' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, href: '/supervisor/reports' },
  ],
)
