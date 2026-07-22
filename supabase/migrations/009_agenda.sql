-- InGlobal — Agenda de Grúas (calendario operativo interno)
-- Migración 009: catálogos (gruas/empresas_agenda/operarios) + eventos_agenda + join eventos_operarios.
-- A diferencia de montajes/clientes/servicios/trabajos, estas tablas NO tienen policy de lectura
-- pública: es data operativa privada, solo `authenticated` (dashboard, TV, app mobile).

CREATE TABLE IF NOT EXISTS public.gruas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre              TEXT NOT NULL,
  patente             TEXT,
  capacidad_toneladas NUMERIC,
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.empresas_agenda (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  contacto   TEXT,
  telefono   TEXT,
  notas      TEXT,
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.operarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  telefono   TEXT,
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.eventos_agenda (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha       DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME,
  grua_id     UUID NOT NULL REFERENCES public.gruas(id) ON DELETE RESTRICT,
  empresa_id  UUID NOT NULL REFERENCES public.empresas_agenda(id) ON DELETE RESTRICT,
  ubicacion   TEXT,
  notas       TEXT,
  estado      TEXT NOT NULL DEFAULT 'programado',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS eventos_agenda_fecha_idx ON public.eventos_agenda(fecha);
CREATE INDEX IF NOT EXISTS eventos_agenda_grua_id_idx ON public.eventos_agenda(grua_id);
CREATE INDEX IF NOT EXISTS eventos_agenda_empresa_id_idx ON public.eventos_agenda(empresa_id);

CREATE TABLE IF NOT EXISTS public.eventos_operarios (
  evento_id   UUID NOT NULL REFERENCES public.eventos_agenda(id) ON DELETE CASCADE,
  operario_id UUID NOT NULL REFERENCES public.operarios(id) ON DELETE RESTRICT,
  PRIMARY KEY (evento_id, operario_id)
);

-- RLS: solo authenticated, ninguna policy para anon/public en estas 5 tablas.
ALTER TABLE public.gruas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_operarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated only - gruas" ON public.gruas;
CREATE POLICY "Authenticated only - gruas"
  ON public.gruas FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated only - empresas_agenda" ON public.empresas_agenda;
CREATE POLICY "Authenticated only - empresas_agenda"
  ON public.empresas_agenda FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated only - operarios" ON public.operarios;
CREATE POLICY "Authenticated only - operarios"
  ON public.operarios FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated only - eventos_agenda" ON public.eventos_agenda;
CREATE POLICY "Authenticated only - eventos_agenda"
  ON public.eventos_agenda FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated only - eventos_operarios" ON public.eventos_operarios;
CREATE POLICY "Authenticated only - eventos_operarios"
  ON public.eventos_operarios FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
