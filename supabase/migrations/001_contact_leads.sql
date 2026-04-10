-- Grúas InGlobal S.R.L. — Contact Leads
-- Migración inicial: tabla de consultas del formulario web

CREATE TABLE IF NOT EXISTS public.contact_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  empresa TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  servicio TEXT,
  message TEXT NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Solo service_role puede leer y administrar
CREATE POLICY "service_role_all" ON public.contact_leads
  USING (auth.role() = 'service_role');

-- Inserción pública (para el formulario de contacto)
CREATE POLICY "public_insert" ON public.contact_leads
  FOR INSERT WITH CHECK (true);
