import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AppShell } from '@/components/AppShell';
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // RLS "cards_delete_owner" ya restringe al dueño; el filtro explícito lo hace evidente.
  const { error } = await supabase.from('cards').delete().eq('slug', slug).eq('owner_id', user.id);
  if (error) console.error('[mis-tarjetas] borrar:', error);

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
    <AppShell>
      <div className={styles.head}>
        <h1 className={styles.title}>Mis tarjetas</h1>
        {rows.length > 0 && (
          <Link href="/crear" className={styles.newBtn}>
            Crear tarjeta
          </Link>
        )}
      </div>

      {error && <p className={styles.note}>No se pudieron cargar tus tarjetas. Recarga la página.</p>}

      {!error && rows.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyMark} aria-hidden />
          <h2 className={styles.emptyTitle}>Aún no tienes tarjetas</h2>
          <p className={styles.emptyBody}>
            Genera tu primera credencial con tu usuario de GitHub o Chess.com. Queda guardada aquí.
          </p>
          <Link href="/crear" className={styles.newBtn}>
            Crear tarjeta
          </Link>
        </div>
      )}

      {rows.length > 0 && (
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
                  <a className={styles.linkBtn} href={`/c/${row.slug}`} target="_blank" rel="noreferrer">
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
      )}
    </AppShell>
  );
}
