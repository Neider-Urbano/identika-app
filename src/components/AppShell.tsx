'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/UserMenu';
import styles from './AppShell.module.css';

const NAV = [
  {
    href: '/mis-tarjetas',
    label: 'Mis tarjetas',
    icon: (
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    ),
  },
  {
    href: '/crear',
    label: 'Crear tarjeta',
    icon: (
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    ),
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden />
          Identika
        </Link>
        <UserMenu />
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Secciones">
          {NAV.map((n) => {
            const on = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={on ? `${styles.navItem} ${styles.navOn}` : styles.navItem}
                aria-current={on ? 'page' : undefined}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  {n.icon}
                </svg>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
