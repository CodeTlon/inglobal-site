-- Foto de grúa/operario para el detalle de catálogo. Mismo bucket `media`
-- que ya se usa para el logo de empresa (ver 028_empresas_agenda_logo.sql
-- y 006_storage_media.sql) — sin bucket ni políticas nuevas.
ALTER TABLE public.gruas ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.operarios ADD COLUMN IF NOT EXISTS foto_url TEXT;
