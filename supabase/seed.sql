-- ============================================================================
-- SEED SOLO PARA DESARROLLO LOCAL (supabase db reset). DATOS 100% FICTICIOS.
-- NUNCA ejecutar contra homologación ni producción.
-- Todas las fechas son relativas al día de hoy en Córdoba (UTC-3): el seed no envejece.
-- Ids fijos para que sea reproducible: grúas ...8000-, empresas ...8001-,
-- operarios ...8002-, eventos ...8003-.
-- ============================================================================

insert into public.gruas (id, nombre, patente, capacidad_toneladas, tipo, activo) values
  ('00000000-0000-4000-8000-000000000001', 'ZZ-PRUEBA Grove 200',     'ZZ001AA', 200, 'Grúa',      true),
  ('00000000-0000-4000-8000-000000000002', 'ZZ-PRUEBA Grove 160',     'ZZ002AA', 160, 'Grúa',      true),
  ('00000000-0000-4000-8000-000000000003', 'ZZ-PRUEBA Linkbelt 60',   'ZZ003AA',  60, 'Grúa',      true),
  ('00000000-0000-4000-8000-000000000004', 'ZZ-PRUEBA XCMG 70',       'ZZ004AA',  70, 'Grúa',      true),
  ('00000000-0000-4000-8000-000000000005', 'ZZ-PRUEBA Hidro 35 A',    'ZZ005AA',  35, 'Hidrogrúa', true),
  ('00000000-0000-4000-8000-000000000006', 'ZZ-PRUEBA Hidro 35 B',    'ZZ006AA',  35, 'Hidrogrúa', true),
  ('00000000-0000-4000-8000-000000000007', 'ZZ-PRUEBA Hidro 15',      'ZZ007AA',  15, 'Hidrogrúa', true),
  ('00000000-0000-4000-8000-000000000008', 'ZZ-PRUEBA Camión Ford',   'ZZ008AA',  48, 'Camión',    true),
  ('00000000-0000-4000-8000-000000000009', 'ZZ-PRUEBA Grúa inactiva', 'ZZ009AA',  25, 'Grúa',      false);

insert into public.empresas_agenda (id, nombre, contacto, telefono, notas, tipo, activo) values
  ('00000000-0000-4000-8001-000000000001', 'ZZ-PRUEBA Constructora Sur',   'Laura Gómez',   '351 555-0101', 'Cliente de obra grande',     'frecuente',  true),
  ('00000000-0000-4000-8001-000000000002', 'ZZ-PRUEBA Refinería Centro',   null,            '351 555-0102', null,                         'frecuente',  true),
  ('00000000-0000-4000-8001-000000000003', 'ZZ-PRUEBA Transportes Norte',  'Martín Pérez',  null,           'Paga a 30 días',             'frecuente',  true),
  ('00000000-0000-4000-8001-000000000004', 'ZZ-PRUEBA Aires Cordobeses',   null,            null,           null,                         'frecuente',  true),
  ('00000000-0000-4000-8001-000000000005', 'ZZ-PRUEBA Juan Particular',    'Juan Ramírez',  '351 555-0105', 'Mudanza de caja fuerte',     'particular', true),
  ('00000000-0000-4000-8001-000000000006', 'ZZ-PRUEBA Ana Particular',     null,            '351 555-0106', null,                         'particular', true);

insert into public.operarios (id, nombre, telefono, roles, activo, eliminado_at) values
  ('00000000-0000-4000-8002-000000000001', 'ZZ-PRUEBA Ariel Gruista',      '351 555-0201', '{Gruista}',                 true,  null),
  ('00000000-0000-4000-8002-000000000002', 'ZZ-PRUEBA Beto Polivalente',   '351 555-0202', '{Gruista,Hidrogruista}',    true,  null),
  ('00000000-0000-4000-8002-000000000003', 'ZZ-PRUEBA Carlos Ayudante',    null,           '{Ayudante}',                true,  null),
  ('00000000-0000-4000-8002-000000000004', 'ZZ-PRUEBA Dario Carretonero',  '351 555-0204', '{Carretonero}',             true,  null),
  ('00000000-0000-4000-8002-000000000005', 'ZZ-PRUEBA Esteban Gruista',    '351 555-0205', '{Gruista}',                 true,  null),
  ('00000000-0000-4000-8002-000000000006', 'ZZ-PRUEBA Fede Ayudante',      '351 555-0206', '{Ayudante,Carretonero}',    true,  null),
  ('00000000-0000-4000-8002-000000000007', 'ZZ-PRUEBA Gabi Hidrogruista',  '351 555-0207', '{Hidrogruista}',            true,  null),
  ('00000000-0000-4000-8002-000000000008', 'ZZ-PRUEBA Hugo sin rol',       null,           '{}',                        true,  null),
  -- Ex operarios (baja lógica): se conservan en el historial de eventos.
  ('00000000-0000-4000-8002-000000000009', 'ZZ-PRUEBA Ex Ignacio',         '351 555-0209', '{Gruista}',                 false, now() - interval '30 days'),
  ('00000000-0000-4000-8002-000000000010', 'ZZ-PRUEBA Ex Julián',          null,           '{Ayudante}',                false, now() - interval '10 days');

-- Eventos. g = índice de grúa (1-9), e = empresa (1-6), ops = operarios (9 y 10 son ex operarios).
-- Cuidado: la misma grúa/operario no puede tener eventos que se pisen (restricción + trigger).
create temp table _ev (n int, off int, hi time, hf time, fh int, g int, e int, estado text, ubic text, notas text, ops int[]);
insert into _ev values
  -- Pasado
  ( 1, -20, '08:00', '12:00', null, 1, 1, 'finalizado', 'Obra Av. Colón',       null,                      '{1,3}'),
  ( 2, -20, '14:00', '17:00', null, 1, 2, 'finalizado', 'Planta Refinería',     null,                      '{1}'),
  ( 3, -15, '09:00', '11:00', null, 2, 3, 'finalizado', 'Parque industrial',    'Con ex operario',         '{2,9}'),
  ( 4, -15, '09:00', '13:00', null, 3, 4, 'cancelado',  'Barrio Jardín',        'Lo canceló el cliente',   '{5}'),
  ( 5, -12, '07:30', '18:00', null, 4, 1, 'finalizado', 'Obra Ruta 9',          'Jornada completa',        '{5,6}'),
  ( 6, -10, '10:00', '12:00', null, 5, 5, 'finalizado', 'Domicilio particular', null,                      '{7}'),
  ( 7, -10, '15:00', '16:30', null, 5, 6, 'cancelado',  'Domicilio particular', null,                      '{7}'),
  ( 8,  -7, '08:00', '09:00', null, 6, 2, 'finalizado', 'Planta Refinería',     'Dos turnos pegados',      '{10}'),
  ( 9,  -7, '09:00', '10:00', null, 6, 2, 'finalizado', 'Planta Refinería',     null,                      '{10}'),
  (10,  -5, '20:00', '23:30', null, 7, 3, 'finalizado', 'Depósito Norte',       'Turno noche',             '{4}'),
  (11,  -3, '08:00', '17:00',   -1, 8, 4, 'finalizado', 'Edificio centro',      'Servicio de varios días', '{2,3}'),
  -- Hoy
  (12,   0, '08:00', '18:00', null, 1, 1, 'en_curso',   'Obra Av. Colón',       'Izaje de estructura',     '{1,4}'),
  (13,   0, '09:00', '12:00', null, 2, 2, 'en_curso',   'Planta Refinería',     null,                      '{2}'),
  (14,   0, '14:00', '17:00', null, 3, 3, 'programado', 'Parque industrial',    null,                      '{5}'),
  (15,   0, '16:00', '19:00', null, 2, 5, 'programado', 'Domicilio particular', null,                      '{2}'),
  -- Próximos días
  (16,   1, '08:00', '12:00', null, 1, 4, 'programado', 'Torre Aires',          null,                      '{1}'),
  (17,   1, '13:00', '17:00', null, 1, 6, 'reserva',    'Domicilio particular', 'Sin operarios asignados', '{}'),
  (18,   2, '22:00', '02:00', null, 7, 3, 'programado', 'Depósito Norte',       'Cruza medianoche',        '{6}'),
  (19,   2, '18:30', null,    null, 9, 1, 'programado', 'Obra Av. Colón',       'Sin hora de fin',         '{8}'),
  -- Día muy cargado: 7 servicios solapados
  (20,   3, '09:00', '12:00', null, 1, 1, 'programado', 'Obra Av. Colón',       null,                      '{1}'),
  (21,   3, '09:00', '12:00', null, 2, 2, 'programado', 'Planta Refinería',     null,                      '{2}'),
  (22,   3, '09:00', '12:00', null, 3, 3, 'reserva',    'Parque industrial',    null,                      '{3}'),
  (23,   3, '09:00', '12:00', null, 4, 4, 'programado', 'Torre Aires',          null,                      '{4}'),
  (24,   3, '09:00', '12:00', null, 5, 5, 'programado', 'Domicilio particular', null,                      '{5}'),
  (25,   3, '09:00', '12:00', null, 6, 6, 'programado', 'Domicilio particular', null,                      '{6}'),
  (26,   3, '10:00', '11:30', null, 8, 2, 'programado', 'Planta Refinería',     null,                      '{7}'),
  (27,   3, '11:30', '14:00', null, 7, 4, 'programado', 'Torre Aires',          null,                      '{8}'),
  (28,   3, '14:00', '15:00', null, 1, 1, 'programado', 'Obra Av. Colón',       null,                      '{1}'),
  -- Servicios cortos seguidos
  (29,   4, '10:00', '10:30', null, 8, 3, 'programado', 'Depósito Norte',       null,                      '{1}'),
  (30,   4, '10:30', '11:00', null, 8, 3, 'programado', 'Depósito Norte',       null,                      '{1}'),
  (31,   4, '11:00', '11:30', null, 8, 5, 'reserva',    'Domicilio particular', null,                      '{1}'),
  (32,   4, '10:00', '11:00', null, 3, 6, 'programado', 'Domicilio particular', null,                      '{2}'),
  (33,   4, '10:15', '10:45', null, 4, 2, 'programado', 'Planta Refinería',     null,                      '{3}'),
  -- Más adelante
  (34,   6, '08:00', '18:00',    8, 4, 4, 'programado', 'Edificio centro',      'Montaje de varios días',  '{2,5}'),
  (35,   7, '09:00', '12:00', null, 1, 5, 'programado', 'Domicilio particular', null,                      '{1}'),
  (36,   7, '09:00', '12:00', null, 2, 6, 'reserva',    'Domicilio particular', null,                      '{3}'),
  (37,  10, '08:00', '17:00', null, 3, 1, 'programado', 'Obra Ruta 9',          null,                      '{4}'),
  (38,  10, '08:00', '17:00', null, 5, 2, 'programado', 'Planta Refinería',     null,                      '{6}'),
  (39,  12, '07:00', '19:00', null, 6, 3, 'programado', 'Parque industrial',    null,                      '{7,8}'),
  (40,  14, '09:00', '13:00', null, 2, 4, 'cancelado',  'Torre Aires',          null,                      '{5}'),
  (41,  18, '08:00', '12:00', null, 7, 5, 'reserva',    'Domicilio particular', null,                      '{}'),
  (42,  21, '10:00', '16:00', null, 1, 6, 'programado', 'Domicilio particular', null,                      '{1,3}'),
  (43,  25, '09:00', '12:00', null, 9, 3, 'programado', 'Depósito Norte',       null,                      '{8}');

insert into public.eventos_agenda (id, fecha, hora_inicio, hora_fin, fecha_hasta, grua_id, empresa_id, ubicacion, notas, estado)
select ('00000000-0000-4000-8003-' || lpad(n::text, 12, '0'))::uuid,
       (now() at time zone 'America/Argentina/Cordoba')::date + off, hi, hf, case when fh is null then null else (now() at time zone 'America/Argentina/Cordoba')::date + fh end,
       ('00000000-0000-4000-8000-' || lpad(g::text, 12, '0'))::uuid,
       ('00000000-0000-4000-8001-' || lpad(e::text, 12, '0'))::uuid,
       ubic, notas, estado
from _ev order by n;

insert into public.eventos_operarios (evento_id, operario_id)
select ('00000000-0000-4000-8003-' || lpad(n::text, 12, '0'))::uuid,
       ('00000000-0000-4000-8002-' || lpad(o::text, 12, '0'))::uuid
from _ev, unnest(ops) as o
order by n;

drop table _ev;
