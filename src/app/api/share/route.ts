import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';
import type { CardData } from '@/lib/connectors/types';

/**
 * Guarda una tarjeta en Supabase y devuelve su slug para el link público
 * /c/<slug>. La tarjeta es un snapshot: si más adelante las stats cambian, el
 * link sigue mostrando lo que se compartió.
 *
 * Si hay sesión, la tarjeta queda con dueño y aparece en "Mis tarjetas"; si no,
 * se guarda anónima (owner_id null) como antes.
 */

// Alfabeto sin caracteres ambiguos (0/O, 1/l/I).
const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

function makeSlug(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  let slug = '';
  for (const b of bytes) slug += SLUG_ALPHABET[b % SLUG_ALPHABET.length];
  return slug;
}

function isCardData(v: unknown): v is CardData {
  if (!v || typeof v !== 'object') return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.platform === 'string' &&
    typeof c.handle === 'string' &&
    typeof c.serial === 'string' &&
    Array.isArray(c.stats)
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  const payload = body as { card?: unknown; accent?: unknown };
  if (!isCardData(payload.card)) {
    return NextResponse.json({ error: 'Falta la tarjeta o tiene un formato inesperado.' }, { status: 400 });
  }
  const card = payload.card;
  const accent =
    typeof payload.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(payload.accent)
      ? payload.accent
      : card.suggestedAccent;

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'El guardado de tarjetas no está configurado en este entorno.' }, { status: 503 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = user?.id ?? null;

  // Reintenta ante la (muy improbable) colisión de slug.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug();
    const { error } = await supabase.from('cards').insert({
      slug,
      platform: card.platform,
      handle: card.handle,
      data: card,
      accent,
      is_public: true,
      owner_id: ownerId,
    });

    if (!error) return NextResponse.json({ slug, saved: Boolean(ownerId) });
    if (error.code !== '23505') {
      console.error('[api/share] error guardando:', error);
      return NextResponse.json({ error: 'No se pudo guardar la tarjeta.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'No se pudo generar un enlace único. Intenta de nuevo.' }, { status: 500 });
}
