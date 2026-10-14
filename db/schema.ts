/**
 * Esquema Drizzle de Grúas InGlobal. Es la fuente de verdad del esquema desde que
 * el proyecto salió de Supabase (ver .ai/context/MIGRACION_SUPABASE.md).
 *
 * Las tablas de negocio replican EXACTO el esquema real de producción de Supabase
 * (extraído el 2026-10-14). Lo que Drizzle no expresa (constraint EXCLUDE de
 * solapamiento de grúas, trigger de solapamiento de operarios) vive en una
 * migración SQL manual: drizzle/0001_solapamientos.sql.
 */

import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  numeric,
  uniqueIndex,
  uuid,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

const id = () => uuid('id').primaryKey().defaultRandom()
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()

// ─── Better Auth ───────────────────────────────────────────────────────────
// Los usuarios de Supabase (auth.users) se importan acá con su hash bcrypt
// (scripts/migracion/importar-prod.ts), conservando el mismo id.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // Contraseña temporal: el panel y la API obligan a cambiarla antes de seguir.
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
)

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Sitio público / CMS ───────────────────────────────────────────────────

export const contactLeads = pgTable('contact_leads', {
  id: id(),
  createdAt: createdAt(),
  name: text('name').notNull(),
  empresa: text('empresa'),
  email: text('email').notNull(),
  phone: text('phone'),
  servicio: text('servicio'),
  message: text('message').notNull(),
})

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: updatedAt(),
})

export const clientes = pgTable('clientes', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  logo: text('logo').notNull(),
  bio: text('bio'),
  content: text('content'),
  featured: boolean('featured').notNull().default(true),
  workRank: integer('work_rank').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  logoFocal: text('logo_focal'),
  logoFocalMobile: text('logo_focal_mobile'),
  tieneBlog: boolean('tiene_blog').notNull().default(false),
})

export const montajes = pgTable('montajes', {
  id: id(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  coverImage: text('cover_image'),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  displayOrder: integer('display_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  coverImageFocal: text('cover_image_focal'),
  bannerImage: text('banner_image'),
  bannerImageFocal: text('banner_image_focal'),
  coverImageFocalMobile: text('cover_image_focal_mobile'),
  bannerImageFocalMobile: text('banner_image_focal_mobile'),
})

export const servicios = pgTable('servicios', {
  id: id(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  desc: text('desc').notNull().default(''),
  specs: text('specs').array().notNull().default(sql`'{}'::text[]`),
  img: text('img').notNull().default(''),
  icon: text('icon').notNull().default(''),
  displayOrder: integer('display_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  excerpt: text('excerpt').notNull().default(''),
})

export const trabajos = pgTable(
  'trabajos',
  {
    id: id(),
    clienteId: uuid('cliente_id')
      .notNull()
      .references(() => clientes.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt'),
    content: text('content').notNull().default(''),
    coverImage: text('cover_image'),
    youtubeUrl: text('youtube_url'),
    displayOrder: integer('display_order').notNull().default(0),
    published: boolean('published').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    fecha: date('fecha', { mode: 'string' }),
    attachmentUrl: text('attachment_url'),
    coverImageFocal: text('cover_image_focal'),
    bannerImage: text('banner_image'),
    bannerImageFocal: text('banner_image_focal'),
    coverImageFocalMobile: text('cover_image_focal_mobile'),
    bannerImageFocalMobile: text('banner_image_focal_mobile'),
    bannerOverlayOpacity: integer('banner_overlay_opacity').notNull().default(100),
    bannerOverlayOpacityMobile: integer('banner_overlay_opacity_mobile'),
  },
  (t) => [
    uniqueIndex('trabajos_cliente_id_slug_key').on(t.clienteId, t.slug),
    index('trabajos_cliente_id_idx').on(t.clienteId),
  ],
)

export const galeria = pgTable('galeria', {
  id: id(),
  imagen: text('imagen').notNull(),
  alt: text('alt').notNull(),
  colSpanMobile: smallint('col_span_mobile').notNull().default(1),
  rowSpanMobile: smallint('row_span_mobile').notNull().default(1),
  colSpanDesktop: smallint('col_span_desktop').notNull().default(1),
  rowSpanDesktop: smallint('row_span_desktop').notNull().default(1),
  displayOrder: integer('display_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

// ─── Agenda ────────────────────────────────────────────────────────────────

export const gruas = pgTable('gruas', {
  id: id(),
  nombre: text('nombre').notNull(),
  patente: text('patente'),
  capacidadToneladas: numeric('capacidad_toneladas'),
  activo: boolean('activo').notNull().default(true),
  createdAt: createdAt(),
  tipo: text('tipo').notNull().default('Grúa'),
  fotoUrl: text('foto_url'),
})

export const empresasAgenda = pgTable('empresas_agenda', {
  id: id(),
  nombre: text('nombre').notNull(),
  contacto: text('contacto'),
  telefono: text('telefono'),
  notas: text('notas'),
  activo: boolean('activo').notNull().default(true),
  createdAt: createdAt(),
  logoUrl: text('logo_url'),
  tipo: text('tipo').notNull().default('particular'),
})

export const operarios = pgTable(
  'operarios',
  {
    id: id(),
    nombre: text('nombre').notNull(),
    telefono: text('telefono'),
    activo: boolean('activo').notNull().default(true),
    createdAt: createdAt(),
    fotoUrl: text('foto_url'),
    roles: text('roles').array().notNull().default(sql`'{}'::text[]`),
    eliminadoAt: timestamp('eliminado_at', { withTimezone: true }),
  },
  (t) => [index('operarios_eliminado_at_idx').on(t.eliminadoAt)],
)

export const eventosAgenda = pgTable(
  'eventos_agenda',
  {
    id: id(),
    fecha: date('fecha', { mode: 'string' }).notNull(),
    horaInicio: time('hora_inicio').notNull(),
    horaFin: time('hora_fin'),
    gruaId: uuid('grua_id').references(() => gruas.id, { onDelete: 'set null' }),
    empresaId: uuid('empresa_id').references(() => empresasAgenda.id, { onDelete: 'set null' }),
    ubicacion: text('ubicacion'),
    notas: text('notas'),
    estado: text('estado').notNull().default('programado'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    fechaHasta: date('fecha_hasta', { mode: 'string' }),
  },
  (t) => [
    index('eventos_agenda_empresa_id_idx').on(t.empresaId),
    index('eventos_agenda_fecha_idx').on(t.fecha),
    index('eventos_agenda_grua_id_idx').on(t.gruaId),
  ],
)

export const eventosOperarios = pgTable(
  'eventos_operarios',
  {
    eventoId: uuid('evento_id')
      .notNull()
      .references(() => eventosAgenda.id, { onDelete: 'cascade' }),
    operarioId: uuid('operario_id')
      .notNull()
      .references(() => operarios.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.eventoId, t.operarioId] })],
)

// ─── TV pairing y notificaciones ───────────────────────────────────────────

export const tvPairingCodes = pgTable(
  'tv_pairing_codes',
  {
    id: id(),
    token: text('token').notNull().unique(),
    status: text('status').notNull().default('pending'),
    approvedBy: text('approved_by').references(() => user.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('tv_pairing_codes_token_idx').on(t.token)],
)

export const pushTokens = pgTable(
  'push_tokens',
  {
    id: id(),
    token: text('token').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    plataforma: text('plataforma'),
    createdAt: createdAt(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('push_tokens_user_idx').on(t.userId)],
)

export const notificacionesEnviadas = pgTable('notificaciones_enviadas', {
  clave: text('clave').primaryKey(),
  enviadaAt: timestamp('enviada_at', { withTimezone: true }).notNull().defaultNow(),
})
