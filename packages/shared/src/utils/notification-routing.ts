/**
 * Notification routing — central matrix of (notification_type, recipient role)
 * → per-surface URL path, plus delivery eligibility.
 *
 * Used at two times:
 * - **create-time** (in route handlers): `isDeliverable(type, recipient)` filters
 *   out targets that don't have the corresponding module (avoid dead links + spam).
 *   `buildActionUrl(type, recipient, metadata)` stamps a canonical URL into the
 *   notification row for inbox display.
 * - **tap-time** (in NotificationsList / NotificationBell): `resolveNotificationRoute`
 *   reads the type + metadata + current user role + surface and returns the
 *   path to navigate to, falling back to the stored `action_url` if no
 *   matrix entry covers the case.
 *
 * The matrix is intentionally explicit (no clever defaults) so adding a new
 * notification type forces an audit of every recipient × surface combo.
 */

export type NotificationType =
  | 'promotion_approved'
  | 'promotion_rejected'
  | 'new_promotion'
  | 'visit_completed'
  | 'order_created'
  | 'qr_redeemed'
  | 'tier_upgrade'
  | 'survey_assigned'
  | 'system'
  | 'survey_approved'
  | 'survey_rejected'
  | 'new_survey_pending'
  | 'points_adjusted'
  | 'assignment_changed'
  | 'supervisor_changed'
  | 'welcome'
  | 'membership_pending'
  | 'client_status_changed'

export type RecipientKind =
  | 'admin'
  | 'brand_manager'
  | 'supervisor'
  | 'promotor'
  | 'asesor_de_ventas'
  | 'client'

export type Surface = 'web' | 'client-mobile' | 'staff-mobile'

type Metadata = Record<string, unknown>
type PathBuilder = (md: Metadata) => string | null

interface RouteEntry {
  web?: PathBuilder
  'client-mobile'?: PathBuilder
  'staff-mobile'?: PathBuilder
}

/** Read a string field from metadata, or null. */
function s(md: Metadata, key: string): string | null {
  const v = md[key]
  return typeof v === 'string' && v.length > 0 ? v : null
}

/** Compose: needs a metadata key, otherwise returns null so we fall back. */
function need(key: string, fn: (id: string) => string): PathBuilder {
  return md => {
    const id = s(md, key)
    return id ? fn(id) : null
  }
}

const literal = (path: string): PathBuilder => () => path

/**
 * (type × recipient) → per-surface path builder. Absence means "not deliverable
 * to that role" (used by isDeliverable).
 */
const MATRIX: Partial<Record<NotificationType, Partial<Record<RecipientKind, RouteEntry>>>> = {
  qr_redeemed: {
    client: {
      web: literal('/client/qr'),
      'client-mobile': literal('/(tabs)/qr'),
    },
    brand_manager: {
      web: need('promotion_id', id => `/brand/promotions/${id}`),
    },
    // asesor_de_ventas intentionally omitted — they're the one scanning the QR,
    // they don't need a notification telling themselves about it.
  },

  order_created: {
    client: {
      web: need('order_id', id => `/client/orders/${id}`),
      'client-mobile': need('order_id', id => `/orders/${id}`),
    },
    asesor_de_ventas: {
      web: need('order_id', id => `/asesor-ventas/orders/${id}`),
      'staff-mobile': need('order_id', id => `/(asesor)/orders/${id}`),
    },
  },

  points_adjusted: {
    client: {
      web: literal('/client/points'),
      'client-mobile': need('brand_id', id => `/points/${id}`),
    },
  },

  tier_upgrade: {
    client: {
      web: literal('/client/points'),
      'client-mobile': need('brand_id', id => `/points/${id}`),
    },
  },

  promotion_approved: {
    brand_manager: {
      web: need('promotion_id', id => `/brand/promotions/${id}`),
    },
  },
  promotion_rejected: {
    brand_manager: {
      web: need('promotion_id', id => `/brand/promotions/${id}`),
    },
  },

  new_promotion: {
    admin: {
      web: need('promotion_id', id => `/admin/promotions/${id}`),
    },
    client: {
      web: need('promotion_id', id => `/client/promotions/${id}`),
      'client-mobile': need('promotion_id', id => `/promotions/${id}`),
    },
  },

  survey_approved: {
    brand_manager: {
      web: need('survey_id', id => `/brand/surveys/${id}`),
    },
  },
  survey_rejected: {
    brand_manager: {
      web: need('survey_id', id => `/brand/surveys/${id}`),
    },
  },
  new_survey_pending: {
    admin: {
      web: need('survey_id', id => `/admin/surveys/${id}`),
    },
  },

  survey_assigned: {
    client: {
      web: need('survey_id', id => `/client/surveys/${id}`),
      'client-mobile': need('survey_id', id => `/(tabs)/surveys/${id}`),
    },
    asesor_de_ventas: {
      web: need('survey_id', id => `/asesor-ventas/surveys/${id}`),
      'staff-mobile': need('survey_id', id => `/(asesor)/surveys/${id}`),
    },
    promotor: {
      web: need('survey_id', id => `/promotor/surveys/${id}`),
      'staff-mobile': need('survey_id', id => `/(promotor)/surveys/${id}`),
    },
    supervisor: {
      web: need('survey_id', id => `/supervisor/surveys/${id}`),
      'staff-mobile': need('survey_id', id => `/(supervisor)/surveys/${id}`),
    },
  },

  visit_completed: {
    supervisor: {
      web: need('visit_id', id => `/supervisor/visits/${id}`),
      'staff-mobile': need('visit_id', id => `/(supervisor)/visits/${id}`),
    },
  },

  assignment_changed: {
    promotor: {
      web: literal('/promotor'),
      'staff-mobile': literal('/(promotor)'),
    },
  },
  supervisor_changed: {
    promotor: {
      web: literal('/promotor'),
      'staff-mobile': literal('/(promotor)'),
    },
  },

  membership_pending: {
    brand_manager: {
      web: literal('/brand/clients'),
    },
  },

  welcome: {
    admin: { web: literal('/admin') },
    brand_manager: { web: literal('/brand') },
    supervisor: { web: literal('/supervisor'), 'staff-mobile': literal('/(supervisor)') },
    promotor: { web: literal('/promotor'), 'staff-mobile': literal('/(promotor)') },
    asesor_de_ventas: { web: literal('/asesor-ventas'), 'staff-mobile': literal('/(asesor)') },
    client: { web: literal('/client'), 'client-mobile': literal('/(tabs)') },
  },

  // `system` is intentionally catch-all — use the raw action_url. Producers
  // should set a valid path or skip action_url entirely.
  // `client_status_changed` reserved for future use — not delivered today.
}

/**
 * Whether a (type, recipient) pair is deliverable at all. If false, callers
 * should skip both the row insert and the push dispatch.
 */
export function isDeliverable(type: NotificationType, recipient: RecipientKind): boolean {
  return !!MATRIX[type]?.[recipient]
}

/**
 * Build the canonical action_url to persist for a given (type, recipient,
 * metadata). Returns null if either (a) not deliverable, or (b) required
 * metadata keys (e.g. `order_id`) are missing — caller should still write the
 * notification but without a deep link.
 *
 * Web is the default surface for stored URLs because it's the most
 * specific (per-role paths). Mobile resolution happens at tap-time via
 * resolveNotificationRoute, which doesn't depend on this stored value.
 */
export function buildActionUrl(
  type: NotificationType,
  recipient: RecipientKind,
  metadata: Metadata
): string | undefined {
  const entry = MATRIX[type]?.[recipient]
  if (!entry?.web) return undefined
  return entry.web(metadata) ?? undefined
}

export interface RouteContext {
  type: NotificationType
  metadata: Metadata
  surface: Surface
  recipient: RecipientKind
}

/**
 * Per-surface "home" route for every recipient role. Used by
 * `safeNotificationRoute` as the last-resort destination when neither the
 * matrix nor the stored action_url yield a navigable path. Keeps tap from
 * silently no-op'ing or pushing a malformed URL that crashes the router
 * (e.g., `/promotions` on mobile, which collides with the dynamic
 * `/promotions/[id]` route and shows "Unmatched Route").
 */
const SAFE_DEFAULTS: Record<Surface, Record<RecipientKind, string>> = {
  web: {
    admin: '/admin',
    brand_manager: '/brand',
    supervisor: '/supervisor',
    promotor: '/promotor',
    asesor_de_ventas: '/asesor-ventas',
    client: '/client',
  },
  'client-mobile': {
    admin: '/(tabs)',
    brand_manager: '/(tabs)',
    supervisor: '/(tabs)',
    promotor: '/(tabs)',
    asesor_de_ventas: '/(tabs)',
    client: '/(tabs)',
  },
  'staff-mobile': {
    admin: '/(promotor)',
    brand_manager: '/(promotor)',
    supervisor: '/(supervisor)',
    promotor: '/(promotor)',
    asesor_de_ventas: '/(asesor)',
    client: '/(promotor)',
  },
}

/**
 * Resolve where a tap should navigate. Prefers the matrix-derived canonical
 * path for the surface; only falls back to `fallbackUrl` (the stored
 * action_url) when the matrix has NO entry for `(type, recipient, surface)`
 * — so legacy notifications with paths like `/client/loyalty` still work.
 *
 * If the matrix HAS an entry but the builder returns null (metadata
 * missing — e.g. `new_promotion` without `promotion_id`), this returns null
 * directly instead of trusting `action_url`: the create-site that failed to
 * supply metadata almost certainly also wrote a malformed action_url, so
 * pushing it (`/promotions` on mobile, where the route is `/promotions/[id]`)
 * leaves the user on an Unmatched Route screen. `safeNotificationRoute`
 * picks a home route in that case.
 */
export function resolveNotificationRoute(
  ctx: RouteContext,
  fallbackUrl: string | null
): string | null {
  const builder = MATRIX[ctx.type]?.[ctx.recipient]?.[ctx.surface]
  if (builder) {
    return builder(ctx.metadata)
  }
  return fallbackUrl
}

/**
 * Like `resolveNotificationRoute` but always returns a navigable path. When
 * the matrix has no entry and the stored action_url is also null, falls back
 * to a per-surface home route from SAFE_DEFAULTS. Tap handlers should prefer
 * this over `resolveNotificationRoute` so a malformed action_url or a
 * notification created without metadata (e.g. by an admin tool or older
 * trigger) never leaves the user staring at a silent no-op or an
 * "Unmatched Route" screen.
 *
 * Note: the surface-home fallback is only used when BOTH matrix and
 * fallbackUrl resolve to null. If a stored action_url exists it's still
 * preferred — preserves intentional custom destinations on `system`-typed
 * notifications and legacy data.
 */
export function safeNotificationRoute(
  ctx: RouteContext,
  fallbackUrl: string | null
): string {
  return (
    resolveNotificationRoute(ctx, fallbackUrl) ??
    SAFE_DEFAULTS[ctx.surface][ctx.recipient]
  )
}
