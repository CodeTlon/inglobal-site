import { test, expect } from '@playwright/test'

// Paridad web/app de la agenda. Solo corre contra el Supabase LOCAL con el seed
// (npm run db:local:up): necesita la cuenta de prueba y los datos ZZ-PRUEBA.
// Activar con E2E_LOCAL_ADMIN=1 y E2E_BASE_URL=http://localhost:<puerto> (el de
// `npm run dev:local`). Nunca apuntarlo a dev/test/prod. Los tests de transicion
// de estado modifican datos: correr `npm run db:local:reset` antes de repetirlos.
test.skip(!process.env.E2E_LOCAL_ADMIN, 'Requiere Supabase local con seed (E2E_LOCAL_ADMIN=1)')

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard/login')
  await page.fill('input[type=email]', 'admin-local@inglobal.test')
  await page.fill('input[type=password]', 'Local-Test-1234')
  await page.click('button[type=submit]')
  await page.waitForURL('**/dashboard')
})

test('catalogos lista ex operarios con acciones', async ({ page }) => {
  await page.goto('/dashboard/agenda/catalogos')
  await expect(page.getByRole('heading', { name: 'Ex operarios' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Reincorporar/ }).first()).toBeVisible()
})

test('evento finalizado queda bloqueado (sin eliminar ni transiciones)', async ({ page }) => {
  await page.goto('/dashboard/agenda/00000000-0000-4000-8003-000000000001')
  await expect(page.getByText('no puede editarse ni eliminarse')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Eliminar' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Iniciar' })).toHaveCount(0)
})

test('evento nuevo ofrece solo reserva o programado', async ({ page }) => {
  await page.goto('/dashboard/agenda/nuevo')
  await expect(page.locator('select[name=estado] option')).toHaveText(['Reserva', 'Programado'])
})

test('catalogos muestra disponible/ocupado hoy en gruas y operarios', async ({ page }) => {
  await page.goto('/dashboard/agenda/catalogos')
  await expect(page.getByText('Ocupado', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Disponible', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/Libera ~\d{2}:\d{2}/).first()).toBeVisible()
})

test('detalle de recurso muestra estadisticas e historial', async ({ page }) => {
  await page.goto('/dashboard/agenda/catalogos')
  const link = page.locator('a[href*="/dashboard/agenda/catalogos/grua/"]').first()
  const href = await link.getAttribute('href')
  await page.goto(href!)
  await expect(page.getByRole('heading', { name: 'Historial de eventos' })).toBeVisible({ timeout: 30000 })
  await expect(page.getByText('Finalizados')).toBeVisible()
})

test('reincorporar un ex operario lo devuelve inactivo', async ({ page }) => {
  await page.goto('/dashboard/agenda/catalogos')
  const antes = await page.getByRole('button', { name: /Reincorporar/ }).count()
  test.skip(antes === 0, 'No quedan ex operarios en el seed (resetear la base local)')
  await page.getByRole('button', { name: /Reincorporar/ }).first().click()
  await expect(page.getByRole('button', { name: /Reincorporar/ })).toHaveCount(antes - 1)
})
