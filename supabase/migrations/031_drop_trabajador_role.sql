-- Se elimina el concepto de rol: un solo tipo de cuenta ("admin" implícito),
-- con acceso total tanto al panel web como a la app mobile. Ver
-- .ai/context/DECISIONS.md ("Decisión: eliminar el rol trabajador").
--
-- is_admin() (022/023) pasa a ser simplemente "está autenticado" — se
-- mantiene el nombre de la función para no tener que tocar cada policy que
-- ya la usa (site_settings/montajes/clientes/servicios/trabajos/galeria/
-- media), solo cambia su definición.
--
-- Cuentas existentes con app_metadata.role = 'trabajador' (creadas antes de
-- este cambio) quedan con ese campo inerte — nada en el código ni en RLS
-- vuelve a leerlo. No hace falta limpiarlo para que la cuenta tenga acceso
-- total; es solo dato viejo sin efecto.

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT auth.role() = 'authenticated'
$$;
