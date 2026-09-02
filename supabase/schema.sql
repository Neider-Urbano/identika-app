-- Identika · esquema de la base de datos (Supabase / Postgres)
--
-- Cómo aplicarlo:
--   1. Dashboard de Supabase → SQL Editor → New query
--   2. Pega TODO este archivo y dale "Run".
--
-- Es idempotente: se puede volver a correr sin romper nada.

-- ---------------------------------------------------------------------------
-- Tabla: cards
-- Una fila por tarjeta compartida. `data` guarda el CardData ya calculado
-- (snapshot), así el link sigue mostrando lo mismo aunque cambien las stats.
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  slug        text primary key,
  platform    text not null,
  handle      text not null,
  data        jsonb not null,
  accent      text not null default '#8b7bff',
  is_public   boolean not null default true,
  owner_id    uuid references auth.users on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists cards_owner_id_idx on public.cards (owner_id);
create index if not exists cards_created_at_idx on public.cards (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Las reglas de acceso viven en la base de datos, no solo en el código
-- (requisito del roadmap → sección Seguridad).
-- ---------------------------------------------------------------------------
alter table public.cards enable row level security;

-- Lectura: cualquiera puede ver una tarjeta pública. El dueño ve las suyas.
drop policy if exists "cards_select_public_or_owner" on public.cards;
create policy "cards_select_public_or_owner"
  on public.cards for select
  using (is_public = true or owner_id = auth.uid());

-- Alta SIN login (Fase 1): se permite crear tarjetas públicas sin dueño.
-- Cuando entre Auth.js, esta policy se reemplaza por "owner_id = auth.uid()".
drop policy if exists "cards_insert_anon_ownerless" on public.cards;
create policy "cards_insert_anon_ownerless"
  on public.cards for insert
  with check (owner_id is null and is_public = true);

-- Alta CON login (ya queda lista para Fase 2): el usuario crea tarjetas suyas.
drop policy if exists "cards_insert_owner" on public.cards;
create policy "cards_insert_owner"
  on public.cards for insert
  with check (owner_id = auth.uid());

-- Editar / borrar: solo el dueño (aplica cuando haya login).
drop policy if exists "cards_update_owner" on public.cards;
create policy "cards_update_owner"
  on public.cards for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "cards_delete_owner" on public.cards;
create policy "cards_delete_owner"
  on public.cards for delete
  using (owner_id = auth.uid());
