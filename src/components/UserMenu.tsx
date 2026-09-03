'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-client';
import styles from './UserMenu.module.css';

function initial(email: string) {
  return email.trim()[0]?.toUpperCase() ?? '·';
}

/** Tono determinístico del avatar a partir del correo. */
function hue(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i += 1) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setEmail(session?.user?.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    setOpen(false);
    setEmail(null);
    router.push('/');
    router.refresh();
  }

  if (!email) {
    return (
      <Link href="/entrar" className={styles.cta}>
        Entrar
      </Link>
    );
  }

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        className={styles.avatar}
        style={{ '--h': hue(email) } as React.CSSProperties}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tu cuenta"
        onClick={() => setOpen((o) => !o)}
      >
        {initial(email)}
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.email}>{email}</div>
          <Link href="/mis-tarjetas" className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            Mis tarjetas
          </Link>
          <Link href="/crear" className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            Crear tarjeta
          </Link>
          <button type="button" className={`${styles.item} ${styles.signOut}`} role="menuitem" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
