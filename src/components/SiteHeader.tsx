'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-client';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  const router = useRouter();
  // Se asume "no logueado" hasta que Supabase confirme; evita un parpadeo raro.
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    setEmail(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden />
        Identika
      </Link>

      <nav className={styles.nav}>
        {email ? (
          <>
            <Link href="/mis-tarjetas" className={styles.link}>
              Mis tarjetas
            </Link>
            <span className={styles.email} title={email}>
              {email}
            </span>
            <button type="button" className={styles.link} onClick={signOut}>
              Salir
            </button>
          </>
        ) : (
          <Link href="/entrar" className={styles.cta}>
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
