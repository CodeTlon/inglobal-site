-- InGlobal — Storage bucket: media
-- Migración 006: bucket público para imágenes y video del dashboard CMS

-- Crear el bucket (público = lectura sin auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

-- Lectura pública
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;
CREATE POLICY "Public can read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Solo authenticated puede subir
DROP POLICY IF EXISTS "Authenticated can upload media" ON storage.objects;
CREATE POLICY "Authenticated can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Solo authenticated puede actualizar
DROP POLICY IF EXISTS "Authenticated can update media" ON storage.objects;
CREATE POLICY "Authenticated can update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Solo authenticated puede borrar
DROP POLICY IF EXISTS "Authenticated can delete media" ON storage.objects;
CREATE POLICY "Authenticated can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');
