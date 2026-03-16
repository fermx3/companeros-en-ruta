'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Star } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { usePageTitle } from '@/hooks/usePageTitle'
import { IconCompletado, IconPendiente, IconClientes } from '@/components/icons'

export default function PromotorProfilePage() {
  usePageTitle('Mi Perfil')
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState({ clients: 0, completedVisits: 0, pendingVisits: 0 })

  const profile = userProfile as {
    id?: string
    first_name?: string
    last_name?: string
    phone?: string
    position?: string
    status?: string
    created_at?: string
  } | null

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—'
  const shortId = profile?.id ? profile.id.substring(0, 10).toUpperCase() : ''

  // Fetch stats
  useEffect(() => {
    if (!profile?.id) return

    const supabase = createClient()
    const profileId = profile.id
    if (!profileId) return
    const fetchStats = async () => {
      const [clientsRes, completedRes, pendingRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_promotor_id', profileId)
          .is('deleted_at', null),
        supabase
          .from('visits')
          .select('id', { count: 'exact', head: true })
          .eq('promotor_id', profileId)
          .eq('visit_status', 'completed'),
        supabase
          .from('visits')
          .select('id', { count: 'exact', head: true })
          .eq('promotor_id', profileId)
          .in('visit_status', ['planned', 'in_progress']),
      ])

      setStats({
        clients: clientsRes.count ?? 0,
        completedVisits: completedRes.count ?? 0,
        pendingVisits: pendingRes.count ?? 0,
      })
    }

    fetchStats()
  }, [profile?.id])

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <div className="w-36 h-36 bg-primary rounded-full flex items-center justify-center mb-6">
          <span className="text-white text-5xl font-bold">
            {fullName.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>

        {/* Name & info */}
        <div className="flex items-center gap-2 mb-1">
          {profile?.status === 'active' && (
            <span className="px-2.5 py-0.5 border border-accent text-accent text-[10px] font-bold uppercase rounded-full tracking-wider">
              Activo
            </span>
          )}
          <h2 className="text-2xl font-bold text-navy">{fullName}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Promotor {shortId && `\u2022 ASR-${shortId}`}
        </p>
        <p className="text-sm text-muted-foreground">&bull; wholesale</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-sm font-medium text-navy">Rating Promedio</span>
          <span className="text-sm font-bold text-navy">0.0</span>
          <Star className="h-4 w-4 text-navy fill-navy" />
        </div>

        {/* Edit Profile button */}
        <Link
          href="/promotor/profile/edit"
          className="mt-5 px-10 py-2.5 border border-secondary/40 text-secondary font-semibold text-sm rounded-full shadow-sm hover:bg-secondary/5 transition-colors"
        >
          Editar Perfil
        </Link>
      </div>

      {/* Stats cards */}
      <div className="space-y-4">
        {/* Clientes Asignados — full width */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground text-center mb-2">Clientes Asignados</p>
          <div className="flex items-center justify-center gap-3">
            <IconClientes className="h-8 w-8 text-navy" />
            <span className="text-4xl font-black text-navy">{stats.clients}</span>
          </div>
        </div>

        {/* Visitas row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <IconCompletado className="h-7 w-7 text-white/80" />
              <span className="text-3xl font-black text-white">{stats.completedVisits}</span>
            </div>
            <p className="text-sm text-white/80">Visitas Completadas</p>
          </div>
          <div className="bg-primary rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <IconPendiente className="h-7 w-7 text-white/80" />
              <span className="text-3xl font-black text-white">{stats.pendingVisits}</span>
            </div>
            <p className="text-sm text-white/80">Visitas Pendientes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
