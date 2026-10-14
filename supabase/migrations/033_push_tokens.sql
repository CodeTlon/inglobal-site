-- InGlobal — Notificaciones push de la app mobile.
-- Mismo criterio que tv_pairing_codes (021): RLS habilitado y CERO policies. Todo el acceso
-- pasa por Route Handlers con service_role (createSupabaseAdminClient); el cliente nunca
-- lee ni escribe estas tablas directo.

-- Un row por dispositivo. `token` es el Expo push token (ExponentPushToken[...]).
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token        TEXT NOT NULL UNIQUE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plataforma   TEXT CHECK (plataforma IN ('ios', 'android')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_tokens_user_idx ON public.push_tokens (user_id);

-- Idempotencia del cron (corre cada 15 min): una clave por aviso ya enviado, p. ej.
-- 'recordatorio:2026-10-15' o 'reserva:<evento_id>'. El UNIQUE hace de candado.
CREATE TABLE IF NOT EXISTS public.notificaciones_enviadas (
  clave      TEXT PRIMARY KEY,
  enviada_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_enviadas ENABLE ROW LEVEL SECURITY;
-- Sin policies a propósito — ver comentario arriba.
