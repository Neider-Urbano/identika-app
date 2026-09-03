import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden />
        Identika
      </Link>
      <nav className={styles.nav}>
        <UserMenu />
      </nav>
    </header>
  );
}
