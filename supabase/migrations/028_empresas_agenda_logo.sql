-- Logo de empresa para el detalle de catálogo. Se sube al bucket `media`
-- que ya existe (ver 006_storage_media.sql), sin bucket ni políticas nuevas.
ALTER TABLE public.empresas_agenda ADD COLUMN IF NOT EXISTS logo_url TEXT;
