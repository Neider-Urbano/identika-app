# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas con presencia en plataformas de datos públicos (GitHub, Chess.com; más
adelante YouTube y otras) que quieren un "carnet" visual y compartible de sus
estadísticas — para un portafolio, la bio de una red, o el gusto de tenerlo.
Llegan desde un link que otra persona compartió, o buscando algo como "generador
de tarjeta de GitHub". El trabajo: generar su tarjeta en segundos, ajustar el
color, y compartirla por link o descargarla como PNG.

## Product Purpose

Convierte los datos públicos de una cuenta en una tarjeta de identidad digital
tipo carnet: foto, handle, un nivel/rango calculado, stats seleccionadas y un
reverso con el desglose. Existe para darle forma bonita y compartible a "quién
soy en esta plataforma", sin scraping ni pedir permisos: solo datos públicos,
traídos por el servidor. Éxito = alguien genera una tarjeta, la comparte, y quien
recibe el link genera la suya.

## Positioning

No es un badge de shields.io ni un dashboard de analytics: es una **credencial**.
Proporción de carnet, anverso y reverso, número de serie, efecto físico (se
inclina en 3D siguiendo el cursor). Las stats se muestran **calculadas** (nivel,
rango, porcentaje) cuando tiene sentido, no como volcado crudo de una API. Un
conector por plataforma traduce a un esquema único de tarjeta, así el mismo
diseño sirve para GitHub, ajedrez y lo que venga.

## Operating Context

- Se usa desde el navegador, sin instalar nada.
- Flujo: elegir plataforma (GitHub / Chess.com) → escribir usuario → generar →
  ajustar color de acento → compartir link `/c/<slug>` o descargar PNG.
- Los links compartidos son **snapshots**: no cambian aunque cambien las stats.
- Con cuenta (correo + contraseña), las tarjetas quedan en "Mis tarjetas".
- Desplegado en Vercel; datos en Supabase (Postgres + Auth + RLS).

## Capabilities and Constraints

- Conectores construidos: **GitHub**, **Chess.com**. Pendientes: YouTube, Facebook/LinkedIn.
- Editor actual: **una tarjeta a la vez** (editor multi-tarjeta pendiente).
- Login: correo + contraseña. Sin magic link ni OAuth por ahora.
- Compartir por link con imagen de preview OpenGraph (1200×630, runtime edge).
- Aún sin rate limiting ni página de privacidad/términos.
- El reverso siempre lleva el aviso "no es un documento de identidad oficial".
- Nunca se inventa un dato: lo que la plataforma no entrega, no se muestra.
- Stack (ya fijado por el código): Next.js 14 App Router + TypeScript, Supabase,
  Vercel. `html-to-image` para el PNG, `@vercel/og` para el preview del link.

## Brand Commitments

- Nombre: **Identika** (nombre de trabajo, pero fijo para el diseño).
- Estética ya decidida: tipo carnet / credencial, tema oscuro "glass",
  inspiración declarada en Aceternity UI y 21st.dev, con efecto 3D tilt + brillo
  siguiendo el mouse.
- Voz: directa, en español, sin marketing inflado. "Genera tu tarjeta", nunca
  "Desbloquea tu potencial".
- El reverso de la tarjeta declara que no es documento oficial (constraint ético).
- Referencias que el usuario hizo vinculantes para consultar dirección visual:
  ui.aceternity.com, 21st.dev, mobbin.com, refero.design, motionsites.ai.

## Evidence on Hand

- App funcional y desplegada en Vercel.
- Componente de tarjeta real: `src/components/IdentikaCard.tsx` (tilt 3D,
  anverso/reverso, QR decorativo, número de serie).
- Conectores reales: `src/lib/connectors/github.ts`, `chess.ts`.
- Imágenes OG de ejemplo ya generadas (Torvalds, Vercel).
- Roadmap vivo: https://claude.ai/code/artifact/8e18840b-487c-4b26-9c3b-1b23afeeda59
- Concepto visual: https://claude.ai/code/artifact/01cf1cce-8f8b-48fe-b053-89408f993d4d
- **No hay**: testimonios, número de usuarios, prensa, métricas de uso. No inventar.

## Product Principles

1. Solo datos públicos, traídos por el servidor — nunca scraping, nunca pedir más
   permisos de los necesarios, nunca inventar un valor.
2. Es una credencial, no un dashboard: forma física (carnet, anverso/reverso,
   serie) y stats presentadas calculadas, no crudas.
3. Fricción cero para probar: generar una tarjeta no requiere cuenta; la cuenta
   solo suma (guardar, listar).
4. Un esquema, muchas plataformas: cada conector traduce a `CardData`; el diseño
   de la tarjeta no cambia por plataforma.
5. Compartir es el motor: el link con preview es lo que trae al siguiente usuario.

## Accessibility & Inclusion

Sin requisito específico más allá de lo estándar: contraste legible en tema
oscuro, foco de teclado visible, y respeto a `prefers-reduced-motion` para el
tilt y las animaciones.
