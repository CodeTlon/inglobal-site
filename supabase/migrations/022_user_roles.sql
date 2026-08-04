-- Roles de usuario: 'admin' (super admin, acceso total) vs 'trabajador' (solo agenda).
-- El rol vive en auth.users.raw_app_meta_data.role (expuesto en el JWT como
-- app_metadata), NO en user_metadata: user_metadata lo puede reescribir el propio
-- usuario autenticado (supabase.auth.updateUser), así que un trabajador podría
-- auto-ascenderse a admin. app_metadata solo lo escribe el service_role (admin API).
-- Sin rol seteado = admin, para no romper cuentas existentes creadas antes de esto.

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin'
$$;

-- Contenido del sitio (no agenda): a partir de ahora solo admin puede escribir.
-- La lectura pública no cambia.
DROP POLICY IF EXISTS "Authenticated can write site_settings" ON public.site_settings;
CREATE POLICY "Admin can write site_settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated can write montajes" ON public.montajes;
CREATE POLICY "Admin can write montajes"
  ON public.montajes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated can write clientes" ON public.clientes;
CREATE POLICY "Admin can write clientes"
  ON public.clientes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated can write servicios" ON public.servicios;
CREATE POLICY "Admin can write servicios"
  ON public.servicios FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated can write trabajos" ON public.trabajos;
CREATE POLICY "Admin can write trabajos"
  ON public.trabajos FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "galeria: escritura autenticada" ON public.galeria;
CREATE POLICY "Admin can write galeria"
  ON public.galeria FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Storage de media (fotos de clientes/servicios/montajes/galería): igual, solo admin escribe.
DROP POLICY IF EXISTS "Authenticated can upload media" ON storage.objects;
CREATE POLICY "Admin can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "Authenticated can update media" ON storage.objects;
CREATE POLICY "Admin can update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "Authenticated can delete media" ON storage.objects;
CREATE POLICY "Admin can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.is_admin());

-- Agenda (gruas/empresas_agenda/operarios/eventos_agenda/eventos_operarios) queda sin
-- cambios: admin y trabajador comparten acceso total, es justamente "el calendario"
-- al que el trabajador sí debe entrar.
