-- Fix de 022: is_admin() devolvía true también para requests SIN sesión
-- (la key pública "anon"), porque su JWT tampoco tiene app_metadata.role y
-- el default de is_admin() era 'admin'. Eso dejó momentáneamente abierta la
-- escritura anónima en site_settings/montajes/clientes/servicios/trabajos/
-- galeria/media — hay que exigir auth.role() = 'authenticated' de nuevo,
-- además del chequeo de rol.

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT auth.role() = 'authenticated'
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin'
$$;
