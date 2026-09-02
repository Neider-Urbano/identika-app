import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { createServerSupabase } from '@/lib/supabase-server';
import { PLATFORM_LABEL, type CardData, type Platform } from '@/lib/connectors/types';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface Row {
  slug: string;
  platform: string;
  handle: string;
  data: CardData;
  created_at: string;
}

async function deleteCard(formData: FormData) {
  'use server';
  const slug = String(formData.get('slug') ?? '');
  if (!slug) return;
  const supabase = createServerSupabase();
  // RLS "cards_delete_owner" garantiza que solo el dueño puede borrarla.
  await supabase.from('cards').delete().eq('slug', slug);
  revalidatePath('/mis-tarjetas');
}

export default async function MisTarjetasPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/entrar?next=/mis-tarjetas');

  const { data, error } = await supabase
    .from('cards')
    .select('slug, platform, handle, data, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as Row[];

  return (
    <>
      <SiteHeader />
      <main className={styles.wrap}>
        <h1 className={styles.title}>Mis tarjetas</h1>

        {error && <p className={styles.note}>No se pudieron cargar tus tarjetas. Recarga la página.</p>}

        {!error && rows.length === 0 && (
          <p className={styles.note}>
            Todavía no has guardado ninguna. Genera una en la{' '}
            <Link href="/">página principal</Link> y pulsa «Compartir».
          </p>
        )}

        <ul className={styles.list}>
          {rows.map((row) => {
            const platformLabel = PLATFORM_LABEL[row.platform as Platform] ?? row.platform;
            return (
              <li key={row.slug} className={styles.item}>
                <div className={styles.info}>
                  <span className={styles.name}>{row.data.displayName}</span>
                  <span className={styles.meta}>
                    {platformLabel} · @{row.handle} · {row.data.rank}
                  </span>
                </div>
                <div className={styles.actions}>
                  <a
                    className={styles.linkBtn}
                    href={`/c/${row.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver
                  </a>
                  <form action={deleteCard}>
                    <input type="hidden" name="slug" value={row.slug} />
                    <button type="submit" className={styles.deleteBtn}>
                      Borrar
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
