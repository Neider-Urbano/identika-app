# Design

<!-- impeccable:design-schema 1 -->

Mundo visual de Identika: **credencial "glass" bajo un lector oscuro**. Un solo
tema (compromiso de marca). Documentado desde el código construido.

## Idea

La tarjeta es una credencial física: proporción de carnet, anverso/reverso,
número de serie, efecto 3D que sigue el cursor. El home no explica el generador,
lo *somete a un lector* — una línea de escaneo baja y revela la tarjeta por capas.
Contra-referencia: el hero dividido de SaaS con captura estática a la derecha.

Contrato de dirección completo: comentario HTML al inicio de `<body>` en
`src/app/layout.tsx` (seed impeccable `86cdb1d5`).

## Color

Estrategia: **neutrales + un acento reservado**. El violeta solo aparece en la
línea de escaneo y en estados vivos (foco, tab activo, links, contador). Cada
plataforma trae su propio acento sugerido (GitHub violeta, Chess.com verde) que
tiñe la tarjeta, no el resto de la página.

Tokens en `src/app/globals.css` (`:root`, oklch):

| Token | Uso |
|---|---|
| `--bg` / `--bg-2` | fondo (radial de `--bg-2` arriba a casi negro abajo) |
| `--surface` / `--surface-2` | paneles "glass" |
| `--border` (9%) / `--border-strong` (16%) | filos translúcidos de 1px |
| `--text` / `--text-muted` / `--text-faint` | jerarquía de texto (nunca gris puro) |
| `--accent` / `--accent-strong` / `--accent-dim` | línea de escaneo, estados vivos |
| `--danger` / `--danger-dim` | errores |

Superficies del navegador tematizadas desde la paleta: `::selection`,
`:focus-visible`, scrollbar, `caret-color`.

## Tipografía

- **Space Grotesk** — display (h1, h2, nombres de tarjeta, marca). Compromiso de
  marca; el detector la marca como sobreusada y se acepta a propósito.
- **Manrope** — texto corrido.
- **Space Mono** — número de serie, valores de stats, el input del generador
  (es un identificador, no prosa).

Se enlazan por `<link>` en runtime (no `next/font`) para que un fallo de red de
Google Fonts nunca rompa el build. Sin eyebrows: los títulos cargan su peso.

`h1`: `clamp(2rem, 6vw, 3.1rem)`, `letter-spacing: -0.03em`, `text-wrap: balance`.

## Componentes clave

| Componente | Archivo | Notas |
|---|---|---|
| `CardScanner` | `src/components/CardScanner.tsx` | Envuelve `IdentikaCard`. `idle` = tarjeta de muestra desvanecida con `mask-image` y línea en reposo pulsante. Al generar (`scanId` nuevo): barrido `clip-path` + línea que baja, 950ms, `cubic-bezier(.22,1,.36,1)`. Red de seguridad de 1500ms + `prefers-reduced-motion` (fade de 260ms). Marcas de esquina como encuadre de escáner. |
| `IdentikaCard` | `src/components/IdentikaCard.tsx` | `container-type: inline-size`. Container queries adaptan las stats por ancho **real de la tarjeta**: <470px stats más compactas; <400px pasan a 2×2 y la tarjeta suelta el `aspect-ratio`; <330px nombre a 16px y se oculta el QR. `flipControl={false}` para quitar el botón de volteo (p.ej. dentro de otro botón). |
| `SiteHeader` | `src/components/SiteHeader.tsx` | Barra fina: marca (rombo + "Identika") a la izquierda, `Entrar` / `Mis tarjetas` + correo + `Salir` a la derecha. `max-width: 680px` alineado con `main`. |

## Dos superficies

**Home (`/`)** — marketing + prueba pre-registro. Columna central `max-width: 680px`.
Orden: hero (titular → generador → tarjeta de ejemplo bajo el lector, marcada
"Ejemplo") · "Qué lleva la credencial" (4 conceptos) · "De un usuario a una
credencial" (4 pasos numerados — secuencia real) · footer. `SiteHeader` arriba
(marca + `UserMenu`). Sin sección de "tarjetas emitidas" — no hay ninguna todavía.

**App (`/mis-tarjetas`, `/crear`)** — para usuarios con sesión, envuelto en
`AppShell`: barra superior (marca + `UserMenu` con avatar) + **sidebar** (Mis
tarjetas / Crear tarjeta, con estado activo por `usePathname`). `/mis-tarjetas`
lista las tarjetas del usuario; su estado vacío vive *dentro* del shell y lleva a
`/crear`, nunca rebota al home. `/crear` = `CardGenerator` con `context="app"`
("Guardar y compartir" → queda en Mis tarjetas).

## Componentes de flujo

| Componente | Notas |
|---|---|
| `CardGenerator` | El generador completo (toggle, input, `CardScanner`, acento, PNG, compartir). Compartido entre home y `/crear` vía prop `context`. Rota tarjetas de ejemplo (`src/lib/example-cards.ts`, snapshots reales) mientras no hay tarjeta generada. |
| `UserMenu` | Sesión propia. Sin sesión → link "Entrar". Con sesión → avatar (inicial + tono determinístico del correo) que abre menú: correo · Mis tarjetas · Crear tarjeta · Cerrar sesión. |
| `AppShell` | Cascarón de la zona con sesión: topbar + sidebar + `content`. Sidebar → fila scrolleable en móvil (<760px). |

## Motion

Un momento autoral: **el barrido de escaneo**. Todo lo demás es hover/foco sutil
(`transition` de 140-180ms). `rest-pulse` en la línea idle. Respeto a
`prefers-reduced-motion` en el scanner.

## Pendiente / conocido

- Detector: "overused font · Space Grotesk" — aceptado (compromiso de marca).
- Revisión de acabado de impeccable (`impeccable-finish-reviewer`) y su verdict
  no se corrieron en esta sesión; recomendado como follow-up.
