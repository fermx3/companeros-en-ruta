import {
  buildActionUrl,
  isDeliverable,
  resolveNotificationRoute,
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

    it('falls back to the stored action_url when matrix cannot resolve', () => {
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

    it('returns null when both matrix and fallback are empty', () => {
      const route = resolveNotificationRoute(
        {
          type: 'survey_assigned',
          recipient: 'client',
          surface: 'client-mobile',
          metadata: {}, // no survey_id
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
})
