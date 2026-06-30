import {
  buildActionUrl,
  isDeliverable,
  resolveNotificationRoute,
  safeNotificationRoute,
} from '@companeros/shared/utils/notification-routing'

describe('notification-routing', () => {
  describe('isDeliverable', () => {
    it('locks survey_assigned to roles that have a surveys module', () => {
      expect(isDeliverable('survey_assigned', 'client')).toBe(true)
      expect(isDeliverable('survey_assigned', 'asesor_de_ventas')).toBe(true)
      expect(isDeliverable('survey_assigned', 'promotor')).toBe(true)
      expect(isDeliverable('survey_assigned', 'supervisor')).toBe(true)
      // brand_manager + admin don't respond to surveys
      expect(isDeliverable('survey_assigned', 'brand_manager')).toBe(false)
      expect(isDeliverable('survey_assigned', 'admin')).toBe(false)
    })

    it('excludes asesor from qr_redeemed notifications (they trigger the event)', () => {
      expect(isDeliverable('qr_redeemed', 'client')).toBe(true)
      expect(isDeliverable('qr_redeemed', 'brand_manager')).toBe(true)
      expect(isDeliverable('qr_redeemed', 'asesor_de_ventas')).toBe(false)
    })

    it('routes promotion approve/reject only to brand_manager', () => {
      expect(isDeliverable('promotion_approved', 'brand_manager')).toBe(true)
      expect(isDeliverable('promotion_approved', 'client')).toBe(false)
      expect(isDeliverable('promotion_approved', 'admin')).toBe(false)
    })
  })

  describe('buildActionUrl', () => {
    it('builds the web path with the metadata id', () => {
      expect(
        buildActionUrl('order_created', 'client', { order_id: 'ord-123' }),
      ).toBe('/client/orders/ord-123')
    })

    it('returns undefined when required metadata is missing', () => {
      expect(buildActionUrl('order_created', 'client', {})).toBeUndefined()
    })

    it('returns undefined for non-deliverable (type, recipient) pairs', () => {
      expect(buildActionUrl('qr_redeemed', 'asesor_de_ventas', {})).toBeUndefined()
    })

    it('fixes the points dead link to /client/points (not /client/loyalty)', () => {
      expect(buildActionUrl('points_adjusted', 'client', { brand_id: 'b1' })).toBe(
        '/client/points',
      )
    })
  })

  describe('resolveNotificationRoute', () => {
    it('prefers matrix-derived path over fallback URL', () => {
      const route = resolveNotificationRoute(
        {
          type: 'order_created',
          recipient: 'client',
          surface: 'client-mobile',
          metadata: { order_id: 'ord-9' },
        },
        '/some-legacy-path',
      )
      expect(route).toBe('/orders/ord-9')
    })

    it('falls back to the stored action_url when matrix has no entry (e.g. system type)', () => {
      const route = resolveNotificationRoute(
        {
          type: 'system',
          recipient: 'client',
          surface: 'web',
          metadata: {},
        },
        '/client/brands',
      )
      expect(route).toBe('/client/brands')
    })

    it('returns null when matrix builder is present but metadata is missing (does NOT trust action_url)', () => {
      // The matrix HAS an entry for survey_assigned/client/client-mobile but it
      // requires `survey_id`. When missing we deliberately ignore the fallback
      // action_url — the create-site that forgot the metadata likely also
      // wrote a malformed action_url. `safeNotificationRoute` provides the
      // safe surface-home destination for tap handlers.
      const route = resolveNotificationRoute(
        {
          type: 'survey_assigned',
          recipient: 'client',
          surface: 'client-mobile',
          metadata: {}, // no survey_id
        },
        '/legacy-but-malformed-path',
      )
      expect(route).toBeNull()
    })

    it('returns null when both matrix and fallback are empty', () => {
      const route = resolveNotificationRoute(
        {
          type: 'survey_assigned',
          recipient: 'client',
          surface: 'client-mobile',
          metadata: {},
        },
        null,
      )
      expect(route).toBeNull()
    })

    it('survey_assigned routes per surface for the same recipient', () => {
      expect(
        resolveNotificationRoute(
          {
            type: 'survey_assigned',
            recipient: 'asesor_de_ventas',
            surface: 'staff-mobile',
            metadata: { survey_id: 's1' },
          },
          null,
        ),
      ).toBe('/(asesor)/surveys/s1')

      expect(
        resolveNotificationRoute(
          {
            type: 'survey_assigned',
            recipient: 'asesor_de_ventas',
            surface: 'web',
            metadata: { survey_id: 's1' },
          },
          null,
        ),
      ).toBe('/asesor-ventas/surveys/s1')
    })

    it('routes supervisor surveys to the supervisor tab on staff-mobile', () => {
      expect(
        resolveNotificationRoute(
          {
            type: 'survey_assigned',
            recipient: 'supervisor',
            surface: 'staff-mobile',
            metadata: { survey_id: 's2' },
          },
          null,
        ),
      ).toBe('/(supervisor)/surveys/s2')
    })
  })

  describe('safeNotificationRoute', () => {
    it('returns the matrix-derived path when available (delegates to resolveNotificationRoute)', () => {
      const route = safeNotificationRoute(
        {
          type: 'order_created',
          recipient: 'client',
          surface: 'web',
          metadata: { order_id: 'ord-1' },
        },
        null,
      )
      expect(route).toBe('/client/orders/ord-1')
    })

    it('falls through to the surface home for client-mobile/client when matrix and action_url are both empty', () => {
      const route = safeNotificationRoute(
        {
          type: 'survey_assigned',
          recipient: 'client',
          surface: 'client-mobile',
          metadata: {},
        },
        null,
      )
      expect(route).toBe('/(tabs)')
    })

    it('falls through to the role home on web when matrix has no entry and action_url is null', () => {
      const route = safeNotificationRoute(
        {
          type: 'system',
          recipient: 'admin',
          surface: 'web',
          metadata: {},
        },
        null,
      )
      expect(route).toBe('/admin')
    })

    it('preserves the stored action_url for legacy/system notifications when matrix has no entry', () => {
      const route = safeNotificationRoute(
        {
          type: 'system',
          recipient: 'client',
          surface: 'web',
          metadata: {},
        },
        '/client/custom-landing',
      )
      expect(route).toBe('/client/custom-landing')
    })

    it('regression — new_promotion+client+client-mobile without promotion_id and an invalid action_url resolves to /(tabs) instead of pushing the broken URL', () => {
      // Repro of the 2026-06-29 bug: a notification created via REST without
      // populating metadata + action_url=/promotions (no [id]) → tap on the
      // mobile inbox previously pushed `/promotions` and the expo-router
      // showed "Unmatched Route" because the dynamic route is /promotions/[id].
      // Now we route to the tabs home and the user can navigate manually.
      const route = safeNotificationRoute(
        {
          type: 'new_promotion',
          recipient: 'client',
          surface: 'client-mobile',
          metadata: {},
        },
        '/promotions',
      )
      expect(route).toBe('/(tabs)')
    })
  })
})
