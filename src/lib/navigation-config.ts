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
  Eye,
  UserCircle,
  Download,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

export interface RoleNavConfig {
  role: string
  title: string
  items: NavItem[]
}

export const brandNavConfig: RoleNavConfig = {
  role: 'brand_manager',
  title: 'Brand Manager',
  items: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/brand' },
    { id: 'kpis', label: 'KPIs', icon: BarChart3, href: '/brand/kpis' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/brand/clients' },
    { id: 'products', label: 'Productos', icon: Package, href: '/brand/products' },
    { id: 'team', label: 'Equipo', icon: UsersRound, href: '/brand/team' },
    { id: 'visits', label: 'Visitas', icon: MapPin, href: '/brand/visits' },
    { id: 'orders', label: 'Ordenes', icon: ShoppingCart, href: '/brand/orders' },
    { id: 'promotions', label: 'Promociones', icon: Tag, href: '/brand/promotions' },
    { id: 'tiers', label: 'Niveles', icon: Layers, href: '/brand/tiers' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, href: '/brand/reports' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/brand/surveys' },
    { id: 'exports', label: 'Exportar Datos', icon: Download, href: '/brand/exports' },
    { id: 'assessment-config', label: 'Config Assessment', icon: ClipboardList, href: '/brand/assessment-config' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/brand/settings' },
  ],
}

export const promotorNavConfig: RoleNavConfig = {
  role: 'promotor',
  title: 'Promotor',
  items: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/promotor' },
    { id: 'visits', label: 'Visitas', icon: MapPin, href: '/promotor/visitas' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/promotor/clients' },
    { id: 'schedule', label: 'Agenda', icon: Calendar, href: '/promotor/schedule' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, href: '/promotor/reports' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/promotor/surveys' },
  ],
}

export const asesorVentasNavConfig: RoleNavConfig = {
  role: 'asesor_de_ventas',
  title: 'Asesor de Ventas',
  items: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/asesor-ventas' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/asesor-ventas/clients' },
    { id: 'orders', label: 'Órdenes', icon: ShoppingCart, href: '/asesor-ventas/orders' },
    { id: 'deliver-qr', label: 'Entregar QR', icon: QrCode, href: '/asesor-ventas/entregar-promocion' },
    { id: 'qr-history', label: 'Historial QR', icon: History, href: '/asesor-ventas/historial-qr' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/asesor-ventas/surveys' },
  ],
}

export const clientNavConfig: RoleNavConfig = {
  role: 'client',
  title: 'Mi Portal',
  items: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/client' },
    { id: 'qr', label: 'Mi QR', icon: QrCode, href: '/client/qr' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, href: '/client/orders' },
    { id: 'brands', label: 'Marcas', icon: Building2, href: '/client/brands' },
    { id: 'points', label: 'Puntos', icon: Star, href: '/client/points' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/client/surveys' },
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle, href: '/client/profile' },
  ],
}

export const adminNavConfig: RoleNavConfig = {
  role: 'admin',
  title: 'Administración',
  items: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/admin' },
    { id: 'brands', label: 'Marcas', icon: Building2, href: '/admin/brands' },
    { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
    { id: 'orders', label: 'Ordenes', icon: ShoppingCart, href: '/admin/orders' },
    { id: 'clients', label: 'Clientes', icon: UsersRound, href: '/admin/clients' },
    { id: 'zones', label: 'Zonas', icon: MapPin, href: '/admin/zones' },
    { id: 'promotions', label: 'Promociones', icon: Tag, href: '/admin/promotions' },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList, href: '/admin/surveys' },
    { id: 'kpi-definitions', label: 'Definiciones KPI', icon: BarChart3, href: '/admin/kpi-definitions' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/admin/settings' },
  ],
}

export const supervisorNavConfig: RoleNavConfig = {
  role: 'supervisor',
  title: 'Supervisor',
  items: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/supervisor' },
    { id: 'team', label: 'Equipo', icon: UsersRound, href: '/supervisor/team' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/supervisor/clients' },
    { id: 'visits', label: 'Visitas', icon: Eye, href: '/supervisor/visits' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, href: '/supervisor/reports' },
  ],
}
