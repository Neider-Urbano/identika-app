import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente de Supabase para código de servidor (Server Components, Route
 * Handlers, Server Actions). Lee y refresca la sesión desde las cookies.
 *
 * En Server Components el `set` de cookies puede fallar (son de solo lectura);
 * por eso va en try/catch — el middleware es el que refresca la cookie de
 * verdad en cada request.
 */
export function createServerSupabase() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* Server Component: lo maneja el middleware */
          }
        },
      },
    },
  );
}

/** Devuelve el usuario autenticado o null. Nunca lanza. */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await createServerSupabase().auth.getUser();
    return user;
  } catch {
    return null;
  }
}
