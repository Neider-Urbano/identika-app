'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-client';
import styles from './page.module.css';

function EntrarForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/mis-tarjetas';
  const linkError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setState('sending');
    setMessage(null);

    const supabase = createBrowserSupabase();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({ email: trimmed, options: { emailRedirectTo } });

    if (error) {
      setState('error');
      setMessage(error.message);
      return;
    }
    setState('sent');
  }

  return (
    <main className={styles.wrap}>
      <p className={styles.eyebrow}>Identika</p>
      <h1 className={styles.title}>Entrar</h1>
      <p className={styles.lede}>
        Sin contraseñas. Escribe tu correo y te enviamos un enlace para entrar. Al hacer clic quedas dentro.
      </p>

      {linkError && (
        <div className={styles.error}>
          El enlace no era válido o ya se usó. Pide uno nuevo.
        </div>
      )}

      {state === 'sent' ? (
        <div className={styles.sent}>
          <strong>Revisa tu correo.</strong>
          <span>Te enviamos un enlace a {email}. Ábrelo en este mismo dispositivo.</span>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className={styles.button} type="submit" disabled={state === 'sending' || !email.trim()}>
            {state === 'sending' ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      )}

      {state === 'error' && message && <div className={styles.error}>{message}</div>}
    </main>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}
