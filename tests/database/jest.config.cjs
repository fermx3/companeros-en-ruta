/**
 * Cross-app DB / RLS test config.
 *
 * These tests exercise Postgres + Supabase RLS and are not tied to any
 * specific app workspace. Run from the repo root: `pnpm test:db`.
 */
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { esModuleInterop: true, target: 'ES2020', module: 'CommonJS' } }],
  },
};
