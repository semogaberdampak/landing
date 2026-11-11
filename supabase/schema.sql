---------------------------------------------------------------------------
Portal KiTA — skema Supabase (hanya jalankan di SQL Editor project)
Tujuan: situs tetap ringan tanpa SDK, semua akses dibatasi Row Level Security.
---------------------------------------------------------------------------

-- 1. Konten website (satu baris = seluruh data yang tampil)
create table if not exists public.portal_content (
  id              text primary key,
  data            jsonb not null default '{}'::jsonb,
  updated_at      timestamptz not null default now()
);

-- 2. Usulan dari pengunjung (dipublikasikan, tidak dilihat umum, bisa hapus)
create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null check (char_length(name) between 1 and 80),
  contact         text not null check (char_length(contact) between 1 and 200),
  portal_name     text not null check (char_length(portal_name) between 1 and 80),
  portal_url      text check (char_length(portal_url) between 0 and 500),
  message         text check (char_length(message) between 0 and 1000),
  created_by      text
);

-- 3. Kebijakan akses
-- Kontent: baca semua, tulis hanya untuk yang login.
alter table public.portal_content enable row level security;

create policy "portal_content_read_any" on public.portal_content
  for select to anon, authenticated
  using (true);

create policy "portal_content_write_logged_in" on public.portal_content
  for insert to authenticated
  with check (true);

create policy "portal_content_upsert_logged_in" on public.portal_content
  for update to authenticated
  using (true)
  with check (true);

-- Usulan: siapa saja bisa mengirim, yang login baca/hapus.
alter table public.submissions enable row level security;

create policy "submissions_insert_any" on public.submissions
  for insert to anon, authenticated
  with check (true);

create policy "submissions_read_logged_in" on public.submissions
  for select to authenticated
  using (true);

create policy "submissions_delete_logged_in" on public.submissions
  for delete to authenticated
  using (true);

-- 4. Izin standar (adakalanya diperlukan di lingkungan tanpa auto-grant)
grant usage on schema public to anon, authenticated;
grant select on public.portal_content to anon, authenticated;
grant insert on public.submissions to anon, authenticated;
grant select on public.submissions to authenticated;
