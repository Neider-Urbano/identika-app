import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * A donde llega el enlace del correo (magic link). Cambia el `code` por una
 * sesión y redirige a `next` (o a "Mis tarjetas").
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/mis-tarjetas';

  if (code) {
    const supabase = createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/'}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=enlace-invalido`);
}
