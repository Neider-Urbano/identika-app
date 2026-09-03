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
  description: 'Escribe tu usuario de GitHub o Chess.com y genera una tarjeta de identidad con tus stats públicas, lista para compartir.',
};

/**
 * Contrato de dirección (impeccable, surface scope, seed 86cdb1d5). Se emite como
 * comentario HTML al principio del <body> para que la revisión de acabado pueda
 * auditar el build contra él.
 */
const DIRECTION_CONTRACT = `
impeccable direction contract · seed 86cdb1d5 · surface: home · mode: persuade

THESIS: El home no explica el generador, lo somete a un lector de credenciales.
La línea de escaneo que baja y revela la tarjeta ES la prueba. Rechaza el hero
dividido con captura estática a la derecha.

OWN-WORLD: Fondo casi negro azulado, superficies "glass" con borde translúcido de
1px, acento violeta reservado a la línea de escaneo y a los estados vivos; verde
Chess / violeta GitHub como acento sugerido por plataforma. Space Grotesk display,
Manrope texto, Space Mono para número de serie y stats. Sin eyebrows.

STORY: El visitante ve una credencial a medio revelar, escribe su usuario, la
línea baja, su tarjeta aparece por capas y queda con tilt. Entiende en segundos
que son sus datos públicos hechos carnet; comparte el link o descarga el PNG.

FIRST VIEWPORT: Barra fina (marca izq, Entrar der). Centrado: titular de una
línea, la "ranura" (toggle de plataforma + input + botón Generar) sobre la zona
de escaneo, donde una tarjeta de ejemplo está parcialmente revelada con la línea
en reposo. Acción primaria: el botón Generar, dentro de la ranura.

FORM: Escáner de credenciales, candidato 3 de la lista, seed 86cdb1d5.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`;

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
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: `<!--${DIRECTION_CONTRACT}-->` }} />
        {children}
      </body>
    </html>
  );
}
