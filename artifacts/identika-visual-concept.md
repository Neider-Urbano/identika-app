---
title: Identika — Concepto visual de la tarjeta
source: Claude artifact 01cf1cce-8f8b-48fe-b053-89408f993d4d
type: visual concept / design canvas
related: identika-roadmap
---

# Identika — Concepto visual de la tarjeta

Artefacto de diseño (canvas de Claude Design) que muestra el aspecto objetivo de la
"tarjeta de identidad digital" que genera la app.

## Características del diseño

- **Formato carnet / credencial**: proporción de tarjeta física, anverso y reverso.
- **Tema oscuro glass**: superficies translúcidas, desenfoque, bordes sutiles.
- **Inspiración**: Aceternity UI y 21st.dev.
- **Efecto 3D tilt**: la tarjeta se inclina siguiendo el cursor del mouse, con brillo
  especular que se desplaza (parallax / glare), como las cards de Aceternity.
- **Color de acento**: personalizable por tarjeta, sugerido según la plataforma
  (GitHub, Chess.com, Steam, YouTube) o elegido a mano.

## Anverso

- Foto de perfil, nombre y handle traídos de la plataforma conectada.
- Bloque de stats de la plataforma, mostradas calculadas (nivel/rango, racha,
  porcentaje) cuando tiene sentido, no como volcado crudo de la API.
- Logo/nombre de la plataforma base.

## Reverso (flip)

- Aviso explícito de que **no es un documento de identidad oficial**.
- Metadatos de la tarjeta (fecha de generación, link público si aplica).

## Implementación de referencia

El componente [`IdentikaCard`](../src/components/IdentikaCard.tsx) es la implementación
en React de este concepto para el conector de GitHub (efecto tilt, descarga PNG con
`html-to-image`). El cálculo de nivel/rango vive en [`level.ts`](../src/lib/level.ts).
