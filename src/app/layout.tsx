import type { Metadata } from 'next';
import './globals.css';

/**
 * Base para resolver las URLs de las imágenes OpenGraph. En Vercel se detecta
 * sola por VERCEL_URL; en local y otros hosts se toma de NEXT_PUBLIC_SITE_URL
 * (ponla al dominio final cuando despleguemos).
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Identika',
  description: 'Genera una tarjeta de identidad digital a partir de tus cuentas conectadas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/*
          Enlace en runtime en vez de next/font: next/font descarga las fuentes
          durante el build y si esa red no está disponible (CI cerrado, red
          corporativa) el build entero falla. Así, si Google Fonts no carga,
          el navegador simplemente cae a la fuente de respaldo — nunca rompe nada.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
