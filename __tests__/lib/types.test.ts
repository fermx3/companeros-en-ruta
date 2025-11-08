import { UserRole, User, Brand } from '@/lib/types'

describe('Type Definitions', () => {
  it('should define correct UserRole types', () => {
    const roles: UserRole[] = ['admin', 'brand', 'supervisor', 'asesor', 'market_analyst', 'client']
    expect(roles).toHaveLength(6)
  })

  it('should validate User interface structure', () => {
    const mockUser: User = {
      id: 'test-id',
      tenant_id: 'test-tenant',
      email: 'test@example.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    expect(mockUser.id).toBe('test-id')
    expect(mockUser.tenant_id).toBe('test-tenant')
    expect(mockUser.is_active).toBe(true)
  })

  it('should validate Brand interface structure', () => {
    const mockBrand: Brand = {
      id: 'brand-id',
      tenant_id: 'test-tenant',
      name: 'Test Brand',
      slug: 'test-brand',
      primary_color: '#000000',
      secondary_color: '#ffffff',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    expect(mockBrand.name).toBe('Test Brand')
    expect(mockBrand.slug).toBe('test-brand')
  })
})
