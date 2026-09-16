-- Rode este arquivo no SQL Editor do Supabase (dashboard do projeto dnhosfeddkripeqxgttv)

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  token uuid not null default gen_random_uuid() unique,
  name text not null,
  custom_message text,
  max_guests integer not null default 1,
  attending boolean,
  confirmed_guests integer,
  rsvp_message text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table guests enable row level security;

-- Backend acessa via chave publishable (anon); nunca exposta ao navegador,
-- so o server Express fala com o Supabase. Escopo por token sempre feito no
-- WHERE da query, entao liberar select/update geral para o role anon aqui e seguro
-- neste contexto (chave nao fica no client).
create policy "anon can read guests" on guests
  for select to anon using (true);

create policy "anon can update rsvp fields" on guests
  for update to anon using (true) with check (true);

-- Criacao de convite so acontece via /api/admin/guests, protegido por ADMIN_SECRET
-- na camada da aplicacao (nao pela chave do banco).
create policy "anon can insert guests" on guests
  for insert to anon with check (true);

-- Site e temporario (evento passa, depois fecha), API de admin publica por ora.
create policy "anon can delete guests" on guests
  for delete to anon using (true);
