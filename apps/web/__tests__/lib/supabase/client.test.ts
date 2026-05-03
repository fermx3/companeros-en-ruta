import { createClient } from '@/lib/supabase/client'

describe('Supabase Client', () => {
  it('should create a client instance', () => {
    const client = createClient()
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })

  it('should use correct environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })
})
