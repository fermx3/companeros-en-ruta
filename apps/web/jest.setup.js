import '@testing-library/jest-dom'

// Mock Supabase
jest.mock('/src/lib/supabase/client.ts', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Env defaults for the test environment.
//
// next/jest loads .env.local / .env first, so locally these only fill any
// gaps. In CI those files don't exist, so these dummies become the actual
// values and let env.web.ts's Zod parse pass at module load.
//
// Tests that mock Supabase don't make real network calls, so the values
// don't have to be real — only schema-valid (URL must be a valid URL,
// strings must be min(1), DEMO_TENANT_ID must be a UUID).
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key'
process.env.NEXT_PUBLIC_APP_DOMAIN ||= 'http://localhost:3000'
process.env.NEXT_PUBLIC_DEMO_TENANT_ID ||= '00000000-0000-0000-0000-000000000000'
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key'
process.env.NEXTAUTH_SECRET ||= 'test-nextauth-secret'
