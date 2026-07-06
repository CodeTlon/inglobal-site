-- 008: galeria — portafolio de imágenes editable desde el dashboard.
-- Reemplaza el array hardcodeado de app/galeria/page.tsx. Cada imagen controla
-- cuántas columnas/filas ocupa en el grid bento, por separado en mobile (grid
-- de 2 columnas) y desktop (grid de 4 columnas) — mismo mecanismo CSS que ya
-- usaba el array estático (col-span/row-span), ahora configurable.

create table if not exists public.galeria (
  id                uuid primary key default gen_random_uuid(),
  imagen            text not null,
  alt               text not null,
  col_span_mobile   smallint not null default 1 check (col_span_mobile between 1 and 2),
  row_span_mobile   smallint not null default 1 check (row_span_mobile between 1 and 2),
  col_span_desktop  smallint not null default 1 check (col_span_desktop between 1 and 4),
  row_span_desktop  smallint not null default 1 check (row_span_desktop between 1 and 2),
  display_order     int not null default 0,
  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.galeria enable row level security;

create policy "galeria: lectura pública" on public.galeria
  for select using (true);

create policy "galeria: escritura autenticada" on public.galeria
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed: mismas 12 imágenes y spans que tenía el array hardcodeado.
insert into public.galeria (imagen, alt, col_span_mobile, row_span_mobile, col_span_desktop, row_span_desktop, display_order) values
  ('igb-1',  'Grúa telescópica principal en operación',        1, 1, 2, 2, 0),
  ('igb-2',  'Hidrogrúa con barquilla en planta industrial',   1, 1, 1, 1, 1),
  ('igb-3',  'Traslado de maquinaria con carretón pesado',     1, 1, 1, 1, 2),
  ('igb-4',  'Montaje de silos en petroquímica',                1, 1, 1, 1, 3),
  ('igb-5',  'Par de grúas operando en tándem',                 1, 1, 1, 1, 4),
  ('igb-6',  'Izaje de estructura metálica en altura',          1, 1, 1, 1, 5),
  ('igb-7',  'Grúa en muelle industrial',                       1, 1, 2, 1, 6),
  ('igb-8',  'Mantenimiento preventivo en obra',                1, 1, 1, 1, 7),
  ('igb-9',  'Izaje nocturno en planta',                        1, 1, 1, 1, 8),
  ('igb-10', 'Grúa telescópica en parque eólico',                1, 1, 1, 1, 9)
on conflict do nothing;
