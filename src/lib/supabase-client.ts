import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para el navegador (Client Components). Maneja la sesión
 * en cookies junto con el cliente de servidor y el middleware.
 */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
