'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-client';
import styles from './page.module.css';

type Mode = 'signin' | 'signup';

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/mis-tarjetas';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function goNext() {
    router.push(next.startsWith('/') ? next : '/mis-tarjetas');
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const mail = email.trim();
    if (!mail || password.length < 6) return;

    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = createBrowserSupabase();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
      setBusy(false);
      if (error) {
        setError(
          error.message.toLowerCase().includes('invalid')
            ? 'Correo o contraseña incorrectos.'
            : error.message,
        );
        return;
      }
      goNext();
      return;
    }

    // signup
    const { data, error } = await supabase.auth.signUp({ email: mail, password });
    setBusy(false);
    if (error) {
      // Pasa cuando "Confirm email" sigue activado en Supabase y no hay SMTP.
      setError(
        /confirmation email|sending/i.test(error.message)
          ? 'No se pudo crear la cuenta. Desactiva «Confirm email» en Supabase → Authentication → Providers → Email.'
          : error.message,
      );
      return;
    }
    if (data.session) {
      goNext();
    } else {
      // "Confirm email" sigue activado en Supabase.
      setInfo('Cuenta creada. Revisa tu correo para confirmarla y luego entra.');
      setMode('signin');
    }
  }

  return (
    <main className={styles.wrap}>
      <p className={styles.eyebrow}>Identika</p>
      <h1 className={styles.title}>{mode === 'signin' ? 'Entrar' : 'Crear cuenta'}</h1>
      <p className={styles.lede}>
        {mode === 'signin'
          ? 'Entra con tu correo y contraseña para ver y guardar tus tarjetas.'
          : 'Solo necesitas un correo y una contraseña de al menos 6 caracteres.'}
      </p>

      {info && <div className={styles.info}>{info}</div>}

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
        <input
          className={styles.input}
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder="Contraseña"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className={styles.button}
          type="submit"
          disabled={busy || !email.trim() || password.length < 6}
        >
          {busy ? 'Un momento…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <button
        type="button"
        className={styles.switch}
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin');
          setError(null);
          setInfo(null);
        }}
      >
        {mode === 'signin' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Entrar'}
      </button>
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
