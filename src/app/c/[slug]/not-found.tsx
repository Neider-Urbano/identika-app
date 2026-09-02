import Link from 'next/link';
import styles from './page.module.css';

export default function SharedCardNotFound() {
  return (
    <main className={styles.wrap}>
      <div style={{ textAlign: 'center', maxWidth: '42ch' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 24, margin: '0 0 8px' }}>
          Esta tarjeta no existe
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
          El enlace está mal escrito o la tarjeta se eliminó.
        </p>
      </div>
      <Link className={styles.cta} href="/">
        Crear una tarjeta →
      </Link>
    </main>
  );
}
