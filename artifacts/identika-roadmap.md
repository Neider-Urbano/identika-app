---
title: Identika Roadmap
source: Claude artifact 8e18840b-487c-4b26-9c3b-1b23afeeda59
type: project roadmap / living document
start: 2026-09-02
last_update: 2026-09-02
current_phase: "Fase 1 · Conectores abiertos"
---

# Identika — Tarjetas de identidad por plataforma

Generador de "carnets" digitales a partir de cuentas conectadas (GitHub, Chess.com,
Steam, YouTube, Facebook, LinkedIn, Instagram). Estado real del proyecto: qué está
decidido, qué se está construyendo y qué sigue pendiente de decidir.

## Fases

- **Fase 1 · Conectores abiertos** (actual): GitHub, Chess.com, Steam, YouTube.
- **Fase 2 · Login básico**: Facebook, LinkedIn (nombre + foto únicamente).
- **Fase 3 · En pausa**: Instagram, LinkedIn a fondo, card de especificaciones del PC.

## Funcionalidades

### Primera versión (Fase 1)
- Iniciar sesión con una cuenta que ya tienes (sin crear contraseña nueva).
- Conectar una o varias plataformas (GitHub, Chess.com, Steam, YouTube) al perfil.
- Crear varias tarjetas y elegir qué plataforma y qué datos muestra cada una.
- Editor con vista previa en vivo: cambios a la izquierda, tarjeta se actualiza al instante a la derecha.
- Elegir el color de acento (sugerido o manual) por tarjeta.
- Compartir por link público o dejarla privada, y descargarla como PNG.
- Botón "Actualizar datos" para refrescar las stats.
- Panel "Mis tarjetas": listar, duplicar y eliminar.
- Borrar cuenta y todos los datos cuando quieras.

### Más adelante
- Login/datos de Facebook y LinkedIn (nombre + foto solamente).
- Exploración pública de tarjetas de otros usuarios (con moderación).
- Plantillas visuales alternativas a la de "carnet".
- Actualización automática periódica de stats.
- Insignias/logros especiales dentro de la tarjeta.
- Notificaciones vía n8n (ej. Telegram) cuando alguien ve o genera tu tarjeta.

## Registro y sesión

**Decisión:** nada de contraseñas propias. Registro e inicio de sesión con una cuenta
existente (GitHub, Google...). El mismo inicio de sesión identifica al usuario y conecta
su primera fuente de datos. Plataformas adicionales se conectan desde el perfil sin
volver a registrarse. Sesión en cookie firmada, de solo servidor, que expira sola y se
renueva mientras el usuario esté activo.

## Seguridad

### Para los usuarios
- Tokens de acceso a cada plataforma guardados cifrados, nunca en texto plano.
- Solo se piden los permisos mínimos a cada plataforma.
- Cada usuario solo puede leer y editar sus propias tarjetas (reglas a nivel de base de datos).
- Todo el sitio bajo HTTPS; cookies de sesión seguras y de solo servidor.
- Rate limiting para proteger la generación de tarjetas y las cuotas gratuitas de las APIs.
- Política de privacidad clara.

### Para el repositorio
- Ninguna llave ni secreto en el código — solo variables de entorno.
- Escaneo automático de secretos y dependencias vulnerables en GitHub.
- Rama principal protegida: cambios por pull request.
- Antes de fusionar: lint, chequeo de tipos y pruebas automáticas.
- Nunca se registran tokens ni datos sensibles en los logs.

## Cómo llegan los datos de cada plataforma

El navegador nunca habla directo con GitHub, Steam, etc. — siempre pasa por el servidor,
único que conoce las llaves de acceso.

1. **Conectas una plataforma**: inicias sesión con ella (o das tu usuario si es una API sin login como Chess.com) una sola vez.
2. **Guardamos solo lo necesario**: el token de acceso queda cifrado en el servidor.
3. **Pides ver o actualizar tu tarjeta**: el servidor usa ese token para pedir los datos públicos a la plataforma.
4. **Se guarda en caché un rato**: para que abrir la tarjeta sea instantáneo y no se gaste la cuota gratuita.
5. **Se dibuja la tarjeta**: con los datos mapeados al formato de Identika (nombre, stats, nivel, etc.).

## Editor de varias tarjetas con vista previa

Pantalla dividida en dos: a la izquierda los controles, a la derecha la tarjeta real
actualizándose al instante.

- **Panel izquierdo (controles)**: elegir plataforma base y stats a mostrar; cambiar color de acento; completar a mano campos que la plataforma no entrega; marcar pública o privada.
- **Panel derecho (vista previa)**: la tarjeta exacta en tiempo real; botón para ver el reverso (flip); botón descargar PNG y botón copiar link.

## Fase 1 — conectores

- **GitHub** — Construido (v1): Proyecto Next.js + TypeScript entregado: formulario, cálculo de stats, tarjeta con efecto 3D y descarga PNG. Falta login/guardar tarjetas.
- **Chess.com** — Listo para construir: API 100% pública, sin key ni autenticación.
- **Steam** — Listo para construir: API pública con key gratuita; requiere perfil de Steam público.
- **YouTube** — Listo para construir: Data API v3, key gratuita de Google Cloud. 10.000 unidades/día, sin login del usuario.

## Fases siguientes

- **Fase 2 · Facebook y LinkedIn** (Limitado): solo vía "Iniciar sesión con…" oficial: nombre y foto de perfil únicamente. Sin conteo de amigos, sin experiencia laboral, sin scraping.
- **Fase 3 · Instagram / LinkedIn a fondo** (Bloqueado): Instagram no permite conectar cuentas personales (solo Business/Creator). LinkedIn a fondo exige contrato empresarial.
- **Card de especificaciones del PC** (En pausa): dashboard aparte para visualizar el propio computador (CPU, RAM, disco, uptime).

## Stack técnico

| Tecnología | Rol | Estado |
|---|---|---|
| Next.js + TS | Frontend + backend en un solo repo | Tentativo |
| Auth.js | Login OAuth por plataforma | Tentativo |
| html-to-image | Exportar la tarjeta a PNG descargable | Tentativo |
| Supabase / Upstash | Guardar el slug de cada tarjeta compartible | Por decidir cuál |
| Vercel | Hosting gratuito | Tentativo |
| n8n | Automatización opcional (a definir qué tarea) | Por definir uso |

## Decidido

- Estética tipo carnet, tema oscuro glass, inspirada en Aceternity UI / 21st.dev.
- Color de acento personalizable: sugerido por plataforma o elegido a mano.
- Reverso de la tarjeta incluye aviso de que no es un documento de identidad oficial.
- Cuando una plataforma no entrega un dato, se deja como campo editable a mano en vez de scrapearlo.
- Orden de construcción: empezar por las plataformas de API abierta y gratuita.
- Efecto 3D: la tarjeta se inclina siguiendo el mouse (tilt + brillo), como las cards de Aceternity.
- Las stats se muestran calculadas (nivel/rango, racha, porcentaje) cuando tiene sentido, no solo el número crudo.

## Pendiente por decidir

- Fórmula del "nivel / rango" que se calcula a partir de las stats de cada plataforma.
- Base de datos para los links compartibles: Supabase vs. Upstash Redis.
- Nombre final del proyecto ("Identika" es el nombre de trabajo).
- Política de privacidad y términos.
- Tarea exacta que haría n8n en el flujo (¿refrescar stats? ¿avisar por Telegram?).
- Dominio propio y despliegue final.

## Relación con el concepto visual

El artefacto `01cf1cce-8f8b-48fe-b053-89408f993d4d` ("Identika") es el concepto visual
de la tarjeta: carnet digital, tema oscuro glass, efecto 3D tilt siguiendo el mouse,
anverso con foto/nombre/stats y reverso con disclaimer. El conector de GitHub ya está
entregado como proyecto Next.js + TypeScript.
