-- 032: empresas con tipo (frecuente/particular), contacto/teléfono opcionales;
-- operarios con roles, teléfono opcional y baja lógica (ex operarios).

-- Empresas ---------------------------------------------------------------
ALTER TABLE empresas_agenda ALTER COLUMN contacto DROP NOT NULL;
ALTER TABLE empresas_agenda ALTER COLUMN telefono DROP NOT NULL;

ALTER TABLE empresas_agenda
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'particular'
  CHECK (tipo IN ('frecuente', 'particular'));

-- Las empresas ya cargadas eran clientes habituales: quedan como frecuentes.
UPDATE empresas_agenda SET tipo = 'frecuente';

-- Operarios --------------------------------------------------------------
ALTER TABLE operarios ALTER COLUMN telefono DROP NOT NULL;

ALTER TABLE operarios
  ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;

CREATE INDEX IF NOT EXISTS operarios_eliminado_at_idx ON operarios (eliminado_at);
