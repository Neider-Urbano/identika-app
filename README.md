# Identika

Genera una tarjeta de identidad digital ("carnet") a partir de una cuenta conectada. Conectores construidos de punta a punta: **GitHub** y **Chess.com** — servidor, cálculo de stats y tarjeta con efecto 3D.

Ver el estado completo del proyecto (funcionalidades, seguridad, fases, pendientes) en el roadmap:
https://claude.ai/code/artifact/8e18840b-487c-4b26-9c3b-1b23afeeda59

Y el concepto visual original de la tarjeta:
https://claude.ai/code/artifact/01cf1cce-8f8b-48fe-b053-89408f993d4d

## Qué hace ahora mismo

1. Eliges la plataforma (GitHub o Chess.com) y escribes un usuario.
2. El servidor (nunca tu navegador) le pide los datos públicos a la API de esa plataforma.
3. Se calculan las stats y un nivel/rango (fórmulas en `src/lib/level.ts`, v1 — ver roadmap):
   - **GitHub**: total de estrellas, lenguaje principal, seguidores; racha si hay token.
   - **Chess.com**: rating por ritmo (rapid/blitz), % de victorias, partidas jugadas.
4. Se dibuja la tarjeta con efecto 3D (sigue el mouse) y reverso con el desglose
   (lenguajes en GitHub, rendimiento por ritmo en Chess.com).
5. Puedes cambiar el color de acento, descargarla como PNG y **compartirla por link**
   (`/c/<slug>`): se guarda un snapshot en Supabase y el botón copia la URL al portapapeles.
   El link trae imagen de preview (OpenGraph 1200×630 generada al vuelo) para que se vea
   la tarjeta al pegarlo en WhatsApp, Twitter, Discord, etc.

Variables de entorno (`.env.local`, copia de `.env.local.example`):
- `GITHUB_TOKEN` — opcional. Sube el límite de GitHub y habilita la stat de "racha".
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — para guardar y compartir
  tarjetas. Son claves públicas (van al navegador); el acceso real lo controla Row Level
  Security. Sin ellas, la app funciona pero el botón "Compartir" responde 503.
- Chess.com no necesita nada.

## Base de datos y login (Supabase)

**1. Esquema.** [`supabase/schema.sql`](supabase/schema.sql) → **Dashboard → SQL Editor →
New query →** pega el archivo → **Run** (idempotente). Crea la tabla `cards` (una fila por
tarjeta compartida, `CardData` en `jsonb`) y las políticas RLS: lectura pública de tarjetas
`is_public`, alta anónima sin dueño, y reglas de dueño (select/insert/update/delete propio).

**2. Login: correo + contraseña, sin correos.** `/entrar` usa `signInWithPassword` /
`signUp` de Supabase Auth. Para que el registro NO mande ningún correo:

- **Authentication → Providers → Email** → desactivar **"Confirm email"** → Save.

Con eso, crear cuenta es instantáneo y no hace falta SMTP, ni Resend, ni dominio.
(No usamos magic link ni OAuth por ahora — el código de ambos está en el historial de git
si algún día se retoman.)

La sesión vive en cookies; `src/middleware.ts` la refresca en cada request. Al compartir
una tarjeta con sesión iniciada, queda con `owner_id` y aparece en `/mis-tarjetas`.

## Cómo correrlo en tu máquina (Windows / PowerShell)

```powershell
# 1. Entra a la carpeta del proyecto
cd identika-app

# 2. Instala las dependencias
npm install

# 3. (Opcional) copia el archivo de variables de entorno y agrega tu token de GitHub
Copy-Item .env.local.example .env.local

# 4. Levanta el servidor de desarrollo
npm run dev
```

Abre http://localhost:3000 en el navegador.

Otros comandos útiles:

```powershell
npm run typecheck   # revisa tipos de TypeScript sin compilar
npm run build       # build de producción (lo corrí yo antes de entregarte esto — pasó limpio)
npm run start       # sirve el build de producción
```

## Verificación que ya se hizo

- `npm run typecheck` — sin errores.
- `npm run build` — build de producción completo y exitoso (Next.js 14, App Router).
- Servidor local (`npm run start`) probado end-to-end contra las APIs reales:
  - `GET /api/card/chess?user=magnuscarlsen` y `?user=hikaru` → tarjeta correcta.
  - `GET /api/card/chess?user=<inexistente>` → 404 con mensaje claro.
  - `GET /api/card/github?user=torvalds` → sigue funcionando por la ruta `[platform]`.
- La tarjeta de Chess.com se revisó en el navegador (frente, stats y reverso "Rendimiento
  por ritmo").
- Supabase: esquema aplicado. Flujo completo probado en navegador — generar → Compartir
  (crea el link, lo copia, lo muestra) → abrir `/c/<slug>` (renderiza la tarjeta compartida).
- Login: `/entrar` es correo + contraseña (registro y acceso en la misma página, con
  toggle). `/mis-tarjetas` redirige a `/entrar` sin sesión. Probado en navegador: el
  registro falla con un aviso claro mientras "Confirm email" siga activado en Supabase;
  desactivándolo, el registro entra directo. Falta probar "Mis tarjetas" con sesión real.
- Imagen OpenGraph: `/c/<slug>/opengraph-image` genera un PNG 1200×630 (probado con avatar
  de foto y con logo, y el fallback para slug inexistente). Next.js inyecta los `<meta
  og:image / twitter:image>` solos. Runtime **edge** a propósito: el de Node de `@vercel/og`
  falla al cargar su fuente cuando la ruta del proyecto tiene espacios en Windows.

## Estructura

```
supabase/
  schema.sql                       # tabla `cards` + políticas RLS (correr en el SQL Editor)
src/
  middleware.ts                    # refresca la sesión de Supabase en cada request
  app/
    page.tsx                       # UI: selector de plataforma, formulario, color, PNG, compartir
    entrar/page.tsx                # login: correo + contraseña (registro y acceso)
    mis-tarjetas/page.tsx          # lista de tarjetas del usuario + borrar (server action)
    c/[slug]/page.tsx              # página pública de una tarjeta compartida
    c/[slug]/opengraph-image.tsx  # imagen de preview del link (1200×630, runtime edge)
    api/card/[platform]/route.ts   # endpoint de generación — resuelve el conector del registro
    api/share/route.ts             # guarda la tarjeta (con dueño si hay sesión) y devuelve el slug
  components/
    IdentikaCard.tsx               # la tarjeta (front/back, efecto 3D)
    SiteHeader.tsx                 # cabecera: marca + Entrar / Mis tarjetas + Salir
  lib/
    supabase.ts                    # cliente anónimo (lecturas públicas) + getCardBySlug + CardRow
    supabase-client.ts             # cliente de navegador (@supabase/ssr)
    supabase-server.ts             # cliente de servidor con sesión en cookies
    supabase-middleware.ts         # helper del middleware
    connectors/
      types.ts                     # esquema único de tarjeta (CardData) + interfaz de conector
      index.ts                     # registro de conectores por plataforma
      github.ts                    # conector de GitHub
      chess.ts                     # conector de Chess.com
    level.ts                       # fórmulas de nivel/rango por plataforma (v1, tentativas)
```

Para agregar Steam, YouTube (u otra): un archivo nuevo en `lib/connectors/` que implemente
`PlatformConnector` y devuelva un `CardData`, más una línea en `lib/connectors/index.ts`.
La ruta `/api/card/[platform]` lo expone sola; el componente de la tarjeta y la página
solo necesitan que la plataforma aparezca en `PLATFORM_LABEL` (y en `PLATFORMS` de
`page.tsx` para que salga en el selector).

## Qué falta (ver roadmap para el detalle completo)

- Editor de varias tarjetas a la vez (hoy es de una).
- Editar tarjetas guardadas (hoy se crean y se borran).
- Rate limiting en `/api/share` y `/api/card` antes de exponerlo públicamente.
- Página de privacidad y términos.
- Conectores de Steam, YouTube, Facebook y LinkedIn.
- Login social (GitHub/Google) o recuperación de contraseña — más adelante, si hace falta.
