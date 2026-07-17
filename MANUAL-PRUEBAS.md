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
- [ ] Subir una foto real de celular (10-20MB) → no cuelga ni tira "unexpected response" (se resizea en el navegador antes de subir).
- [ ] Subir un video MP4 de más de 4.5MB (pero bajo 20MB) → sube directo al bucket sin pasar por el límite de Vercel, preview funciona.
- [ ] Subir un video de más de 20MB → mensaje de error claro al instante, sin intentar la subida.
- [ ] Subir un PDF de más de 4.5MB (pero bajo 8MB) en el adjunto de un trabajo → sube igual, no falla por el límite de Vercel.
- [ ] Subir una imagen de más de unos pocos MB → se procesa (resize/WebP) sin timeout ni error silencioso.
- [ ] Subir un archivo que no sea imagen/video válido → error claro, no sube basura al bucket.
- [ ] Reemplazar una imagen ya subida (mismo campo) → la vieja se borra del bucket `media` (verificar en el dashboard de Supabase Storage).
- [ ] Apretar "Quitar" en un `ImageUpload`/`VideoUpload` sin reemplazar → el archivo también se borra del bucket, no queda huérfano.
- [ ] Borrar un montaje/cliente/trabajo/item de galería que tenga imagen → el archivo asociado desaparece del bucket junto con la fila.

## Orden (`display_order` / `work_rank`)
- [ ] Crear dos montajes (o clientes/servicios/trabajos del mismo cliente) con el mismo número de orden → el segundo se guarda con el siguiente valor libre, sin error y sin pisar al primero.
- [ ] Editar un registro existente al mismo `display_order` que otro → se resuelve solo (no bloquea el guardado).

## Agenda — solapamiento y eventos de varios días
- [ ] Crear un evento con una grúa en un horario, luego crear otro con la MISMA grúa en un horario que se pisa (mismo día) → el segundo se rechaza con mensaje claro nombrando la grúa/fecha/horario en conflicto.
- [ ] Igual que arriba pero con el mismo operario asignado en ambos eventos (grúas distintas) → también se rechaza.
- [ ] Crear dos eventos con la misma grúa en horarios que NO se pisan (ej. 9-11 y 11-13 el mismo día) → ambos se guardan sin error.
- [ ] Editar un evento existente sin cambiar nada → no se rechaza a sí mismo como conflicto.
- [ ] Crear un evento con "Hasta" (varios días) con una grúa → crear otro evento con esa misma grúa en un día intermedio del rango → se rechaza.
- [ ] Crear un evento de varios días → aparece repetido en cada día del rango en `/dashboard/agenda/calendario` y en `/agenda-tv` (no solo en el primer día).

## Agenda — catálogos y eventos
- [ ] Crear una empresa sin completar "Contacto"/"Teléfono" → se guarda sin el error de Zod ("Invalid input: expected string, received null").
- [ ] Crear un evento sin elegir grúa o empresa → mensaje "Seleccioná una grúa/empresa" (no el error genérico de Zod).
- [ ] Intentar crear una grúa sin patente o sin capacidad → rechazo con mensaje claro, no se guarda.
- [ ] Intentar crear un operario sin teléfono → rechazo con mensaje claro.
- [ ] Editar una grúa existente desde Catálogos (nombre/tipo/patente/capacidad) → "Guardar" persiste los cambios, "Cancelar" descarta y vuelve a la fila normal.
- [ ] Crear una grúa con tipo "Hidrogrúa"/"Camión"/"Otro" → se guarda y se lista con ese tipo.
- [ ] Cargar un evento con fecha fuera del rango permitido (anterior a hoy o más de 6 meses adelante) → el date picker nativo lo bloquea (min/max del input).
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

## Ronda 2 post-QA, Fase 10/12 — Agenda: validaciones
- [ ] Crear una empresa sin "Contacto" o sin "Teléfono" → rechazo con mensaje claro (antes eran opcionales).
- [ ] Intentar cargar un evento con fecha de hoy hacia atrás → bloqueado tanto por el date picker como si se fuerza el request (validación server-side).
- [ ] Cargar un evento con hora de fin menor a (hora de inicio + 15 min) → error claro antes de enviar el form (client-side) y también si se bypassea el form.
- [ ] Cargar un trabajo con fecha futura → rechazado; el date picker tampoco deja elegir una fecha posterior a hoy.
- [ ] En el sidebar del panel, parado en `/dashboard/agenda/calendario` o `/dashboard/agenda/catalogos` → el link "Agenda de Grúas" ya NO se marca activo (solo se resalta en `/dashboard/agenda` exacto).

## Ronda 2 post-QA, Fase 11/12 — Rediseño del calendario
- [ ] `/dashboard/agenda/calendario` → grilla semanal (días en columnas, horarios en filas 7-19hs), sin sidebar ni topbar del panel visibles (pantalla completa oscura con logo arriba).
- [ ] En mobile (375px), esa misma vista → la grilla scrollea horizontal, la columna de horarios queda fija a la izquierda mientras se scrollea.
- [ ] Navegar con "Semana anterior"/"Semana siguiente" → cambia el rango de fechas mostrado (verificar vía la URL `?week=`).
- [ ] Un evento con estado "Programado" cuya hora de fin ya pasó (ej. cargado ayer) → se ve pintado como "Finalizado" en la grilla, sin que el campo real en la DB haya cambiado (editarlo de nuevo debe seguir mostrando "Programado" en el select del form).
- [ ] `/agenda-tv` → grilla mensual clásica (semanas x días) en vez del listado agrupado anterior; cada celda muestra la cantidad de eventos del día y hasta 3 nombres/horarios. Probar en una resolución tipo TV (1920x1080 horizontal) — nada debe recortarse ni verse ilegible a distancia.
- [ ] Días de meses vecinos (ej. últimos días de junio en la grilla de julio) se ven atenuados/grises, no confundibles con los del mes actual.

## Ronda 2 post-QA, Fase 12/12 — Pipeline de video (parcial, deploy sigue en Vercel)
- [ ] Subir un video al hero o al editor de trabajos → sigue funcionando igual que antes (Vercel no tiene `ffmpeg`, así que el archivo se sube tal cual, sin transcodear) — verificar que NO se rompe el upload.
- [ ] Intentar subir un video de más de 20MB → rechazado con mensaje claro (antes el límite era 50MB).
- [ ] `/dashboard/contenido/hero`: cargar un video distinto para "mobile" → en `/` con el viewport angosto (<768px) se reproduce ese video en vez del de desktop.
- [ ] En el video de fondo del hero, click sobre el preview para fijar el foco → el recorte visual cambia acorde en el home (mismo mecanismo que el foco de imágenes).
- [ ] Bajar "Opacidad del overlay" a, por ejemplo, 50 y guardar → el degradé sobre el hero se ve más transparente. Dejarlo en 100 (default) → el home se ve exactamente igual que antes de este cambio.
- [ ] En `ContentEditor` (trabajos), usar el botón "Video propio" para subir un MP4 → se inserta un `<video>` con controles en el contenido, no desborda el ancho del editor ni del artículo público.
- [ ] Pendiente de probar de verdad una vez que el deploy pase a Coolify: confirmar que `ffmpeg` está en el runtime y que un video de ~20MB efectivamente se re-comprime al subirlo (comparar tamaño en el bucket antes/después).

## Ronda de fixes post-uso — badge/cierre de trabajo, home, calendario, uploads, alertas
- [ ] Entrar a un trabajo (`/clientes/[slug]/[trabajo]`) → el nombre del cliente aparece en cursiva sin fondo de color (blanco sobre foto de hero, navy sobre fondo claro sin hero).
- [ ] Ese mismo trabajo, si el cliente tiene "Bio" cargada en el dashboard → al final del artículo aparece un bloque con el logo del cliente + esa bio, antes del link "Volver a {cliente}". Si el cliente NO tiene bio → no aparece nada (no queda un hueco vacío).
- [ ] Home, sección "Qué Hacemos" → la foto de cada card es más grande y aparece la descripción del servicio (`servicio.desc`) debajo del título. Un servicio sin `desc` cargado → no deja un hueco vacío.
- [ ] `/dashboard/agenda` (listado) → el estado de cada evento se ve con mayúscula inicial ("Programado", "En curso"), no en minúsculas ni con guion bajo.
- [ ] `/dashboard/agenda/calendario` → fondo blanco (no oscuro), click en cualquier evento de la grilla abre un modal con grúa/empresa/horario/ubicación/operarios/notas/estado. Cerrar con la X, click afuera del modal, o Escape.
- [ ] `/agenda-tv` → sigue igual que antes (fondo oscuro, sin click en eventos) — confirmar que este cambio NO la afectó.
- [ ] Cualquier `<textarea>` del dashboard (ej. "Descripción" de Quiénes Somos) → ya no se puede agrandar/achicar arrastrando la esquina inferior derecha.
- [ ] Elegir un archivo en un `ImageUpload`/`VideoUpload` y apretar "Guardar cambios" del formulario ANTES de que termine de subir (subida lenta/archivo grande) → el campo guarda el valor anterior, nunca un link que empiece con `blob:`. Esperar a que termine la subida y guardar de nuevo → ahí sí persiste la imagen nueva.
- [ ] Imágenes que hayan quedado con un link `blob:` roto de ANTES de este fix (ej. banner de un trabajo, foto de Quiénes Somos) no se autorreparan — hay que volver a subirlas una vez a mano.
- [ ] `/dashboard/contenido/accesos-rapidos` (y las otras 9 páginas de Contenido) → tienen un link "← Volver al panel" arriba de todo.
- [ ] Guardar cualquier form de `contenido/*` (ej. Hero) → el banner verde "Cambios guardados correctamente" desaparece solo a los 3 segundos (antes quedaba para siempre en pantalla).
- [ ] Crear, editar y borrar un montaje/cliente/servicio/trabajo/foto de galería/evento de agenda por separado → el toast de abajo a la derecha dice "Creado correctamente" / "Guardado correctamente" / "Eliminado correctamente" según corresponda (antes siempre decía lo mismo).

## Formulario de contacto público
- [ ] Enviar el formulario con datos válidos → llega el email a `COMPANY_EMAIL` vía Resend.
- [ ] Enviar con campos faltantes → validación Zod bloquea antes de llamar a Resend.
