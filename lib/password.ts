import bcrypt from 'bcryptjs'

/**
 * Hash de contraseñas: bcrypt. Es el mismo formato que usaba Supabase Auth
 * ($2a$10$...), así que los usuarios migrados entran con su contraseña de
 * siempre sin reset (ver .ai/context/MIGRACION_SUPABASE.md).
 */
const COST = 10

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
