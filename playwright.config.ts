import { defineConfig, devices } from '@playwright/test'

// Variables opcionales (no cambian el comportamiento por defecto):
// - E2E_BASE_URL: apuntar a un servidor ya levantado (p. ej. `npm run dev:local`
//   en el puerto de tu rango) en vez de `next start` en 3310. Usalo con
//   E2E_LOCAL_ADMIN=1 para los tests del dashboard (solo contra la base local con seed: npm run db:local:setup).
// - PLAYWRIGHT_CHROMIUM_PATH: ejecutable de Chromium si el instalado en la
//   maquina no coincide con la revision que espera esta version de Playwright.
const externalBase = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: externalBase ?? 'http://localhost:3310',
    trace: 'on-first-retry',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: externalBase
    ? undefined
    : {
        command: 'node scripts/start-standalone.mjs 3310',
        url: 'http://localhost:3310',
        reuseExistingServer: !process.env.CI,
      },
})
