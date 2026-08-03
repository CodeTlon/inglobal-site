-- InGlobal — Pairing QR de TV (login remoto vía app mobile, tipo Netflix/YouTube en smart TVs).
-- A diferencia de toda otra tabla del schema (RLS solo `authenticated`, porque todo cliente ya
-- está logueado antes de tocarlas), acá el cliente que necesita escribir es la TV, que por
-- definición TODAVÍA NO tiene sesión. En vez de agregar una policy `anon` (superficie de ataque
-- innecesaria — cualquiera podría generar/pollear códigos a mano), la tabla queda con RLS
-- habilitado y CERO policies: deny-by-default para anon y authenticated por igual. Todo el
-- acceso pasa exclusivamente por Route Handlers de Next.js usando el cliente admin/service_role
-- (createSupabaseAdminClient, ya usado en app/actions/users.ts), que aplica sus propios chequeos
-- de TTL y de un solo uso en código.

CREATE TABLE IF NOT EXISTS public.tv_pairing_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token        TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'consumed', 'expired')),
  approved_by  UUID REFERENCES auth.users(id),
  approved_at  TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tv_pairing_codes_token_idx ON public.tv_pairing_codes (token);

ALTER TABLE public.tv_pairing_codes ENABLE ROW LEVEL SECURITY;
-- Sin policies a propósito — ver comentario arriba.
