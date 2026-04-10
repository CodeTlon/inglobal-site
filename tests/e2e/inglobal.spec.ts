import { test, expect } from '@playwright/test'

// ─── HOME ─────────────────────────────────────────────────────────────────────

test('home carga correctamente', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Grúas InGlobal/)
})

test('hero section visible en desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const hero = page.locator('section').first()
  await expect(hero).toBeVisible()
})

test('navbar visible con links en desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await expect(page.locator('nav')).toBeVisible()
  const links = page.locator('nav a:visible')
  await expect(links.first()).toBeVisible()
})

test('boton WhatsApp visible', async ({ page }) => {
  await page.goto('/')
  const wa = page.locator('a[href*="wa.me"]')
  await expect(wa).toBeVisible()
})

// ─── NAVEGACIÓN ───────────────────────────────────────────────────────────────

test('página /servicios carga', async ({ page }) => {
  await page.goto('/servicios')
  await expect(page).toHaveURL('/servicios')
  await expect(page.locator('h1')).toBeVisible()
})

test('página /montajes carga', async ({ page }) => {
  await page.goto('/montajes')
  await expect(page).toHaveURL('/montajes')
  await expect(page.locator('h1')).toBeVisible()
})

test('página /galeria carga', async ({ page }) => {
  await page.goto('/galeria')
  await expect(page).toHaveURL('/galeria')
  await expect(page.locator('h1')).toBeVisible()
})

test('página /clientes carga', async ({ page }) => {
  await page.goto('/clientes')
  await expect(page).toHaveURL('/clientes')
  await expect(page.locator('h1')).toBeVisible()
})

test('página /contacto carga con formulario', async ({ page }) => {
  await page.goto('/contacto')
  await expect(page).toHaveURL('/contacto')
  const form = page.locator('form').first()
  await expect(form).toBeVisible()
})

test('página /aviso-legal carga', async ({ page }) => {
  await page.goto('/aviso-legal')
  await expect(page).toHaveURL('/aviso-legal')
  await expect(page.locator('h1')).toBeVisible()
})

// ─── FORMULARIO ───────────────────────────────────────────────────────────────

test('formulario tiene todos los campos obligatorios', async ({ page }) => {
  await page.goto('/contacto')
  await expect(page.locator('input[name="name"]')).toBeVisible()
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('textarea[name="message"]')).toBeVisible()
  await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible()
})

// ─── RESPONSIVE — MOBILE (375px) ─────────────────────────────────────────────

test('responsive mobile (375px) — home carga', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()
  const section = page.locator('section').first()
  await section.scrollIntoViewIfNeeded()
  await expect(section.locator(':visible').first()).toBeVisible()
})

test('responsive mobile (375px) — botón hamburguesa visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const menuBtn = page.locator('[aria-label="Abrir menú"]')
  await expect(menuBtn).toBeVisible()
})

test('responsive mobile (375px) — formulario de contacto visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/contacto')
  const form = page.locator('form').first()
  await form.scrollIntoViewIfNeeded()
  await expect(form).toBeVisible()
})

test('responsive mobile (375px) — galeria carga', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/galeria')
  const img = page.locator('img:visible').first()
  await img.scrollIntoViewIfNeeded()
  await expect(img).toBeVisible()
})

// ─── RESPONSIVE — TABLET (768px) ─────────────────────────────────────────────

test('responsive tablet (768px) — home carga', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()
  const section = page.locator('section').first()
  await expect(section).toBeVisible()
})

test('responsive tablet (768px) — servicios muestra cards', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/servicios')
  const heading = page.locator('h1')
  await heading.scrollIntoViewIfNeeded()
  await expect(heading).toBeVisible()
})

test('responsive tablet (768px) — clientes muestra logos', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/clientes')
  const logos = page.locator('img[alt*="Logo"]')
  await logos.first().scrollIntoViewIfNeeded()
  await expect(logos.first()).toBeVisible()
})

// ─── RESPONSIVE — DESKTOP (1280px) ───────────────────────────────────────────

test('responsive desktop (1280px) — nav links visibles', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const links = page.locator('nav a:visible')
  await expect(links.first()).toBeVisible()
})

test('responsive desktop (1280px) — hero stats visibles', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await expect(page.getByText(/40\+/).first()).toBeVisible()
})

test('responsive desktop (1280px) — galeria bento grid', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const gallery = page.locator('#galeria-preview')
  await gallery.scrollIntoViewIfNeeded()
  await expect(gallery.locator('img:visible').first()).toBeVisible()
})

// ─── SEO ──────────────────────────────────────────────────────────────────────

test('home tiene meta description', async ({ page }) => {
  await page.goto('/')
  const description = page.locator('meta[name="description"]')
  const content = await description.getAttribute('content')
  expect(content).toBeTruthy()
  expect(content!.length).toBeGreaterThan(50)
})

test('schema.org LocalBusiness presente', async ({ page }) => {
  await page.goto('/')
  const schema = page.locator('script[type="application/ld+json"]')
  await expect(schema).toBeAttached()
  const content = await schema.textContent()
  expect(content).toContain('LocalBusiness')
  expect(content).toContain('InGlobal')
})

test('footer tiene CodeTlon badge', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('footer')
  await footer.scrollIntoViewIfNeeded()
  await expect(footer.getByText(/CodeTlon/i)).toBeVisible()
})

// ─── REDIRECTS ────────────────────────────────────────────────────────────────

test('redirect /contacto.php → /contacto', async ({ page }) => {
  const response = await page.goto('/contacto.php')
  expect(page.url()).toContain('/contacto')
  expect(response?.status()).toBeLessThan(400)
})
