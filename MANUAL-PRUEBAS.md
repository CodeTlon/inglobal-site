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
- [ ] Reemplazar una imagen ya subida (mismo campo) → la vieja se borra del bucket `media` (verificar en el dashboard de Supabase Storage).
- [ ] Apretar "Quitar" en un `ImageUpload`/`VideoUpload` sin reemplazar → el archivo también se borra del bucket, no queda huérfano.
- [ ] Borrar un montaje/cliente/trabajo/item de galería que tenga imagen → el archivo asociado desaparece del bucket junto con la fila.

## Orden (`display_order` / `work_rank`)
- [ ] Crear dos montajes (o clientes/servicios/trabajos del mismo cliente) con el mismo número de orden → el segundo se guarda con el siguiente valor libre, sin error y sin pisar al primero.
- [ ] Editar un registro existente al mismo `display_order` que otro → se resuelve solo (no bloquea el guardado).

## Agenda — catálogos y eventos
- [ ] Crear una empresa sin completar "Contacto"/"Teléfono" → se guarda sin el error de Zod ("Invalid input: expected string, received null").
- [ ] Crear un evento sin elegir grúa o empresa → mensaje "Seleccioná una grúa/empresa" (no el error genérico de Zod).
- [ ] Intentar crear una grúa sin patente o sin capacidad → rechazo con mensaje claro, no se guarda.
- [ ] Intentar crear un operario sin teléfono → rechazo con mensaje claro.
- [ ] Editar una grúa existente desde Catálogos (nombre/tipo/patente/capacidad) → "Guardar" persiste los cambios, "Cancelar" descarta y vuelve a la fila normal.
- [ ] Crear una grúa con tipo "Hidrogrúa"/"Camión"/"Otro" → se guarda y se lista con ese tipo.
- [ ] Cargar un evento con fecha fuera del rango permitido (más de ~7 días atrás o más de 6 meses adelante) → el date picker nativo lo bloquea (min/max del input).
- [ ] Entrar a `/dashboard/agenda/calendario` logueado → ve el mismo listado agrupado (Hoy/Mañana/Semana/Próximamente) que `/agenda-tv`, sin ningún link de editar/borrar.
- [ ] `/agenda-tv` (kiosco) sigue funcionando igual que antes (fullscreen, auto-refresh, sin sidebar del dashboard).

## UX de formularios del dashboard (redirect + confirm dialog + preview)
- [ ] Crear/editar un montaje/cliente/servicio/trabajo/imagen de galería/evento con datos válidos → redirige a la página base (listado) en vez de quedarse mostrando un banner verde.
- [ ] Provocar un error de validación en cualquiera de esos forms (ej. slug vacío) → se queda en el mismo form, con los datos tal cual se dejaron y el banner rojo de error (no se pierde lo tipeado).
- [ ] Borrar cualquier registro (montaje/cliente/trabajo/imagen de galería/evento/catálogo de agenda) → aparece el modal de confirmación propio del sitio (no el `confirm()` gris del navegador); "Cancelar" no borra nada, "Eliminar" borra y redirige al listado.
- [ ] Elegir un archivo en un `ImageUpload`/`VideoUpload` → el preview aparece de inmediato (antes de que termine de subir), y se reemplaza por la URL real una vez terminada la subida.

## Estilos del sitio público (navbar, hero de cliente, artículos)
- [ ] Entrar a `/montajes/[slug]` (hero siempre oscuro) sin hacer scroll → navbar oscuro con logo claro (el del Footer). Hacer scroll → navbar pasa a blanco con logo de color.
- [ ] Entrar a `/clientes/[slug]/[trabajo]` de un trabajo CON foto de portada → mismo comportamiento de navbar oscuro. Un trabajo SIN foto de portada → navbar blanco normal desde el inicio (no tiene el marcador de hero oscuro).
- [ ] Entrar a cualquier otra página (home, servicios, contacto, etc.) → navbar sin cambios, comportamiento de siempre.
- [ ] Entrar a `/clientes/[slug]` → el logo del cliente se ve sobre una card blanca con sombra, no directo sobre el fondo gris del header.
- [ ] Ver un trabajo con imágenes chicas y/o muy verticales insertadas en el contenido rico (TipTap) → ya no se estiran/pixelan ni desbordan el ancho del artículo.
- [ ] Home: la sección de servicios ("Qué Hacemos") muestra solo foto + título + tags, sin ícono circular ni descripción larga.
- [ ] Confirmar que no queda ningún rastro del botón flotante de WhatsApp en ninguna página del sitio público.

## Guardado de site_settings (bug crítico corregido) + Accesos rápidos + Login
- [ ] Editar y guardar Hero, Footer, Stats, Quiénes Somos, Qué Hacemos, CTA Banner, Clientes Destacados, Ubicación y Contacto → cada uno debe guardar sin el error "El valor debe ser JSON válido." y reflejar el cambio en el sitio público (antes de este fix, NINGUNO guardaba).
- [ ] Guardar Stats con 1, 2 o 3 indicadores → se ven correctamente en el home (antes de este fix, siempre mostraba los 3 valores hardcodeados sin importar lo guardado).
- [ ] Entrar a `/dashboard/contenido/accesos-rapidos`, agregar/editar/quitar un acceso → se refleja como card en el home del panel (`/dashboard`), con ícono y mejor estilo que antes.
- [ ] Header del panel en mobile (375px) → "Grúas InGlobal S.R.L." completo, sin cortarse ni decir "— CMS".
- [ ] `/dashboard/login` en desktop (≥1024px) → imagen a la izquierda (50vw x 100vh), form a la derecha. En mobile, sin imagen (layout de siempre).

## Features nuevas de contenido (trabajos: fecha, PDF, focal point, galería)
- [ ] Cargar un trabajo con fecha → se ve formateada en el detalle público (`/clientes/[slug]/[trabajo-slug]`).
- [ ] Subir un PDF a un trabajo → aparece el link "Descargar PDF" en el detalle público y abre el archivo. Subir un PDF de más de 8MB → rechazado con mensaje claro.
- [ ] Elegir un foco distinto al centro en la imagen de portada de un montaje/trabajo o el logo de un cliente (click sobre la miniatura en el dashboard) → el recorte visual cambia acorde en el sitio público.
- [ ] En Galería, usar el `SpanPicker` (grilla de cuadraditos) para elegir cuántas columnas/filas ocupa una imagen en mobile y desktop → el layout bento en `/galeria` refleja lo elegido, igual que antes con los selects.
- [ ] Items de galería ya cargados antes de este cambio (con `col_span`/`row_span` numérico) siguen viéndose igual — el `SpanPicker` es solo un input visual nuevo, no cambia el formato de los datos guardados.

## Auth — cambio de contraseña
- [ ] Crear un usuario nuevo desde `/dashboard/usuarios` → loguearse con esa cuenta → debe redirigir forzoso a `/dashboard/cambiar-password`, sin poder navegar a ninguna otra ruta de `/dashboard/**` hasta cambiarla.
- [ ] Cambiar la contraseña en esa pantalla → redirige a `/dashboard` y a partir de ahí navega libre (sin volver a pedir el cambio).
- [ ] Resetear la contraseña de una cuenta existente desde `/dashboard/usuarios` → esa cuenta también queda forzada a cambiarla en su próximo login.
- [ ] Con una cuenta que NO tiene el flag activo, entrar a "Cambiar mi contraseña" desde `/dashboard/usuarios` → puede cambiarla voluntariamente en cualquier momento, sin estar forzado.
- [ ] Verificar que no hay loop de redirect: `/dashboard/cambiar-password` es accesible incluso con el flag activo (no redirige a sí misma).

## Ronda 2 post-QA, Fase 8/12 — contenido público
- [ ] Home: la sección "Qué Hacemos" muestra solo foto + título (más grande que antes), sin tags/etiquetas debajo.
- [ ] Entrar a `/montajes/[slug]` sin hacer scroll → navbar oscuro matchea el gris casi negro del hero (ya no un negro más puro/distinto).
- [ ] Entrar a `/clientes/[slug]/[trabajo]` de un trabajo CON foto de portada → navbar SIEMPRE claro (antes se ponía oscuro con la foto) — el nombre del cliente aparece en un badge navy sobre la foto (antes amarillo).
- [ ] Entrar a `/clientes/[slug]` → ya NO aparece el logo del cliente junto al título (solo nombre + historia + lista de trabajos).
- [ ] Entrar al detalle de un trabajo de ese cliente → el logo aparece ahí, en una card blanca, antes del copete.
- [ ] En el dashboard, editar un montaje o un trabajo y cargar una "Imagen de banner" distinta a la de portada → el detalle público usa el banner; el listado sigue mostrando la portada. Sin cargar banner → el detalle cae a la portada (sin romperse).
- [ ] Borrar un montaje/trabajo que tenga banner cargado → confirmar que el archivo del banner también se borra del bucket `media` (no queda huérfano).

## Ronda 2 post-QA, Fase 9/12 — UX del dashboard
- [ ] Editar un trabajo con contenido largo/antiguo en `ContentEditor` → si en algún caso el editor visual no carga, debe verse un aviso + un textarea plano editable (no un form roto ni una pantalla de error genérica).
- [ ] En cualquier `ImageUpload`/`VideoUpload`, elegir un archivo y, antes de que termine de subir, elegir otro rápidamente → el preview final debe ser el del último archivo elegido, sin quedar roto.
- [ ] Abrir cualquier formulario del panel (montajes, clientes, trabajos, etc.) en desktop ancho → ya no debería quedar tanto espacio vacío a los costados.
- [ ] Insertar un video de YouTube en `ContentEditor` (trabajos) → no debe desbordar el ancho del editor ni en desktop ni en mobile.
- [ ] Crear un montaje o un cliente nuevo → no hay campo de slug, se genera solo a partir del título/nombre; si el título cambia después, el slug solo se regenera si cambió el título.
- [ ] Entrar a `/dashboard/contenido/accesos-rapidos` → ahora es una lista de checkboxes predefinidos, no texto libre. Tildar/destildar algunos y guardar → se reflejan como cards en el home del panel.
- [ ] El topbar del panel ya NO tiene el link "Cambiar contraseña" → está en `/dashboard/usuarios`.
- [ ] Hacer scroll en el sidebar o en el contenido del panel → la scrollbar se ve delgada y con los colores del sitio, no la nativa del navegador.
- [ ] Guardar o borrar un montaje/cliente/servicio/trabajo/foto de galería/evento de agenda → tras el redirect a la lista, aparece un toast "Guardado correctamente" abajo a la derecha que desaparece solo (y la URL queda limpia, sin `?saved=1` colgando).

## Formulario de contacto público
- [ ] Enviar el formulario con datos válidos → llega el email a `COMPANY_EMAIL` vía Resend.
- [ ] Enviar con campos faltantes → validación Zod bloquea antes de llamar a Resend.
