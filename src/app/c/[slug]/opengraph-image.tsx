import { ImageResponse } from 'next/og';
import { getCardBySlug } from '@/lib/supabase';
import { PLATFORM_LABEL, type Platform } from '@/lib/connectors/types';

// Edge: el runtime de Node de @vercel/og falla al cargar su fuente por defecto
// cuando la ruta del proyecto tiene espacios en Windows ("proyectos futuro").
// Edge no tiene ese problema y @supabase/supabase-js funciona igual (usa fetch).
export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Tarjeta de Identika';

const BG = '#0b0e14';
const PANEL = '#141922';
const TEXT = '#eceef2';
const MUTED = '#97a0b0';
const BORDER = '#252c3a';
const HEX = /^#[0-9a-fA-F]{6}$/;

/** Descarga el avatar y lo pasa a data URI; si falla, se omite (no rompe la imagen). */
async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? 'image/png';
    if (!type.startsWith('image/')) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
    return `data:${type};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const loaded = await getCardBySlug(params.slug);

  if (!loaded) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: BG,
            color: TEXT,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          IDENTIKA
        </div>
      ),
      size,
    );
  }

  const { card } = loaded;
  const accent = HEX.test(loaded.accent) ? loaded.accent : '#8b7bff';
  const avatar = await toDataUri(card.avatarUrl);
  const platformLabel = PLATFORM_LABEL[card.platform as Platform] ?? card.platform;
  const stats = card.stats.slice(0, 4);
  const nameSize = card.displayName.length > 20 ? 48 : 62;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          color: TEXT,
          padding: 70,
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: accent }} />

        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 16, height: 16, background: accent, transform: 'rotate(45deg)' }} />
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 3, color: MUTED }}>IDENTIKA</div>
          </div>
          <div
            style={{
              display: 'flex',
              border: `2px solid ${accent}`,
              color: accent,
              borderRadius: 999,
              padding: '8px 22px',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {platformLabel}
          </div>
        </div>

        {/* Cuerpo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 70 }}>
          {avatar ? (
            <img
              src={avatar}
              width={156}
              height={156}
              style={{ borderRadius: 999, border: `3px solid ${BORDER}` }}
            />
          ) : (
            <div
              style={{
                width: 156,
                height: 156,
                borderRadius: 999,
                background: PANEL,
                border: `3px solid ${BORDER}`,
              }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: nameSize, fontWeight: 700, lineHeight: 1.05 }}>{card.displayName}</div>
            <div style={{ fontSize: 26, color: MUTED }}>
              {`@${card.handle}${card.location ? ` · ${card.location}` : ''}`}
            </div>
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                marginTop: 4,
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: '8px 18px',
                fontSize: 22,
                color: accent,
                fontWeight: 700,
              }}
            >
              {card.rank}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 18, marginTop: 'auto' }}>
          {stats.map((stat) => (
            <div
              key={stat.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: PANEL,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: '20px 26px',
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 16, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Pie */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 34,
            fontSize: 18,
            color: MUTED,
          }}
        >
          <div style={{ display: 'flex' }}>{`ID · ${card.serial}`}</div>
          <div style={{ display: 'flex' }}>Genera la tuya en Identika</div>
        </div>
      </div>
    ),
    size,
  );
}
