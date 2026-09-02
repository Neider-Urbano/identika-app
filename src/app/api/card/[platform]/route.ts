import { NextRequest, NextResponse } from 'next/server';
import { getConnector } from '@/lib/connectors';
import { ConnectorError } from '@/lib/connectors/types';

/**
 * Endpoint único para todas las plataformas: /api/card/github?user=…,
 * /api/card/chess?user=…, etc. El conector se resuelve del registro
 * (lib/connectors/index.ts) según el segmento [platform].
 *
 * Caché en memoria muy simple para no gastar la cuota de las APIs externas en
 * cada visita. Vive solo mientras el proceso del servidor está corriendo — en
 * producción esto se reemplaza por Supabase/Upstash (ver roadmap, pendiente
 * "base de datos para links compartibles").
 */
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const platform = params.platform.toLowerCase();
  const connector = getConnector(platform);

  if (!connector) {
    return NextResponse.json({ error: `Plataforma "${platform}" no soportada todavía.` }, { status: 404 });
  }

  const username = request.nextUrl.searchParams.get('user')?.trim();
  if (!username) {
    return NextResponse.json({ error: 'Falta el parámetro "user".' }, { status: 400 });
  }

  const cacheKey = `${platform}:${username.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const card = await connector.fetchCard(username);
    cache.set(cacheKey, { data: card, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(card);
  } catch (err) {
    if (err instanceof ConnectorError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(`[api/card/${platform}] error inesperado:`, err);
    return NextResponse.json({ error: 'Algo salió mal generando la tarjeta.' }, { status: 500 });
  }
}
