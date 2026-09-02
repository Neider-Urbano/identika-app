import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IdentikaCard } from '@/components/IdentikaCard';
import { PLATFORM_LABEL, type Platform } from '@/lib/connectors/types';
import { getCardBySlug } from '@/lib/supabase';
import styles from './page.module.css';

/** Cachea cada tarjeta compartida 5 min en el edge; el contenido es un snapshot. */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const loaded = await getCardBySlug(params.slug);
  if (!loaded) return { title: 'Tarjeta no encontrada · Identika' };

  const { card } = loaded;
  const platformLabel = PLATFORM_LABEL[card.platform as Platform] ?? card.platform;
  const title = `${card.displayName} · ${platformLabel} · Identika`;
  const description = `${card.rank} — tarjeta de ${platformLabel} de @${card.handle} generada en Identika.`;

  // La imagen la genera src/app/c/[slug]/opengraph-image.tsx; Next.js la añade sola
  // a openGraph y twitter. Aquí solo va el texto.
  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharedCardPage({ params }: { params: { slug: string } }) {
  const loaded = await getCardBySlug(params.slug);
  if (!loaded) notFound();

  return (
    <main className={styles.wrap}>
      <IdentikaCard data={loaded.card} accent={loaded.accent} />
      <Link className={styles.cta} href="/">
        Crea la tuya en Identika →
      </Link>
    </main>
  );
}
