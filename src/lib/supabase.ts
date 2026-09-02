import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CardData } from './connectors/types';

/**
 * Cliente de Supabase con la clave pública (publishable / anon). Es la que puede
 * ir en el navegador: todo el acceso real lo controla Row Level Security en la
 * base de datos (ver el SQL en supabase/schema.sql). La service_role key nunca
 * se usa aquí.
 *
 * Sin login todavía: se usa el mismo cliente en el servidor (rutas API) y para
 * lecturas públicas de tarjetas compartidas.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local — copia .env.local.example.',
    );
  }
  if (!client) {
    client = createClient(url, anonKey, { auth: { persistSession: false } });
  }
  return client;
}

/** Forma de una fila de la tabla `cards`. */
export interface CardRow {
  slug: string;
  platform: string;
  handle: string;
  data: unknown; // CardData serializado
  accent: string;
  is_public: boolean;
  owner_id: string | null;
  created_at: string;
}

/**
 * Lee una tarjeta compartida por su slug. Devuelve `null` si no existe, si la
 * consulta falla o si Supabase no está configurado — quien llama decide qué
 * hacer (404 en la página, imagen de respaldo en el OG, etc.).
 */
export async function getCardBySlug(slug: string): Promise<{ card: CardData; accent: string } | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await getSupabase()
    .from('cards')
    .select('data, accent')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Pick<CardRow, 'data' | 'accent'>;
  return { card: row.data as CardData, accent: row.accent };
}
