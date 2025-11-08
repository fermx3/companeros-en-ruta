/**
 * Setup para tests E2E con Playwright
 * Este archivo configura fixtures personalizados para Playwright
 * Nota: Los tests E2E deberían ejecutarse con `npm run test:e2e`, no con Jest
 */

// Archivo de configuración para Playwright - no ejecutable como test Jest
export const E2E_CONFIG = {
  baseURL: 'http://localhost:3000',
  testUser: {
    email: 'test@example.com',
    password: 'password123'
  }
}

// Documentación: Para tests E2E usar:
// - Instalar Playwright: npm install -D @playwright/test
// - Ejecutar: npx playwright test
// - Este archivo se usa para configuración, no como test unitario
