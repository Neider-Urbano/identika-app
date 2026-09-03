import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { CardGenerator } from '@/components/CardGenerator';
import { createServerSupabase } from '@/lib/supabase-server';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function CrearPage() {
  const {
    data: { user },
  } = await createServerSupabase().auth.getUser();

  if (!user) redirect('/entrar?next=/crear');

  return (
    <AppShell>
      <h1 className={styles.title}>Crear tarjeta</h1>
      <p className={styles.sub}>
        Escribe tu usuario de GitHub o Chess.com. Al pulsar «Guardar y compartir» queda en Mis
        tarjetas con su link público.
      </p>
      <div className={styles.gen}>
        <CardGenerator context="app" />
      </div>
    </AppShell>
  );
}
