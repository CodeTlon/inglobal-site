# Manual de pruebas — Grúas InGlobal

Checklist de testing manual para flujos con riesgo real de bug que los tests automáticos no atrapan
(criterio humano de UI, timing/concurrencia, credenciales externas, auth). Se completa a medida que
se construyen o tocan esas features.

## Login / Auth del dashboard (`/dashboard`)
- [ ] Ir a `/dashboard` sin sesión → redirige a `/dashboard/login` (no muestra el panel).
- [ ] Login con email/password incorrectos → mensaje de error visible, no rompe la página.
- [ ] Login correcto → redirige al panel (`/dashboard`) y el sidebar muestra las secciones (Contenido, Montajes, Clientes, Servicios).
- [ ] Cerrar sesión → vuelve a bloquear `/dashboard/**` hasta loguear de nuevo.
- [ ] Recargar la página estando logueado → la sesión persiste (cookies SSR), no vuelve a pedir login.

## Contenido editable (`site_settings`)
- [ ] Editar Hero (headline/subheadline/CTAs) → guardar → recargar `/` en otra pestaña → el cambio aparece.
- [ ] Subir un video en Hero (`VideoUpload`) → el home muestra el `<video>` en vez de la imagen fallback.
- [ ] Borrar el video del Hero (dejar vacío) → el home vuelve a mostrar la imagen fallback sin romper el layout.
- [ ] Editar Quiénes Somos, Qué Hacemos, CTA Banner, Clientes Destacados, Ubicación, Footer, Contacto → cada uno refleja el cambio en su página/sección pública correspondiente.
- [ ] Con Supabase caído/URL mal configurada → el sitio público sigue funcionando con el contenido de fallback (`lib/constants.ts`), sin pantalla de error.

## Montajes (CRUD)
- [ ] Crear un montaje nuevo desde el dashboard (con foto) → aparece en `/montajes` y en `/montajes/[slug]`.
- [ ] Editar un montaje existente → el detalle público se actualiza.
- [ ] Despublicar (`published = false`) → desaparece del listado público pero no rompe si alguien tiene el link viejo (verificar comportamiento esperado: 404 o oculto).
- [ ] Borrar un montaje → desaparece de `/montajes` y `/montajes/[slug]` da 404.

## Clientes destacados (CRUD + orden)
- [ ] Crear un cliente nuevo con `work_rank` alto → aparece primero en `/clientes` y en la sección "Clientes Destacados" del home.
- [ ] Cambiar `work_rank` de un cliente existente → el orden del listado público cambia de acuerdo.
- [ ] Cliente sin logo → no rompe el layout de la card.
- [ ] Borrar un cliente → desaparece de `/clientes` y su `/clientes/[slug]` da 404.

## Servicios (CRUD)
- [ ] Crear/editar un servicio → se refleja en `/servicios`.
- [ ] Click en la card "Qué Hacemos" del home → navega a `/servicios` con el servicio correcto preseleccionado/anclado.

## Upload de imágenes/video (Storage `media`)
- [ ] Subir una imagen de más de unos pocos MB → se procesa (resize/WebP) sin timeout ni error silencioso.
- [ ] Subir un archivo que no sea imagen/video válido → error claro, no sube basura al bucket.
- [ ] Reemplazar una imagen ya subida → la vieja no queda huérfana rompiendo referencias (o se documenta que sí puede quedar huérfana en Storage).

## Formulario de contacto público
- [ ] Enviar el formulario con datos válidos → llega el email a `COMPANY_EMAIL` vía Resend.
- [ ] Enviar con campos faltantes → validación Zod bloquea antes de llamar a Resend.
