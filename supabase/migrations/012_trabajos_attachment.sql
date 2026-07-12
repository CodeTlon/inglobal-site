-- Trabajos: adjunto PDF opcional (planos, certificados, informes).
ALTER TABLE public.trabajos
  ADD COLUMN attachment_url TEXT;
