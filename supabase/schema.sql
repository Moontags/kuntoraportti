create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text,
  customer_phone text,
  customer_email text,
  inspection_type text,
  bike_make text,
  bike_model text,
  bike_year text,
  bike_color text,
  bike_reg text,
  bike_vin text,
  bike_km text,
  bike_fuel text,
  inspection_data jsonb,
  overall_status text,
  overall_notes text,
  inspector text,
  photo_urls text[] not null default '{}',
  photo_captions text[] not null default '{}'
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_status_idx on public.reports (overall_status);
create index if not exists reports_bike_reg_idx on public.reports (bike_reg);

alter table public.reports enable row level security;

-- Kehityksessa: julkinen luku, kirjoitus vain service role/API-reittien kautta.
drop policy if exists "Public read reports" on public.reports;
create policy "Public read reports"
  on public.reports
  for select
  using (true);

insert into storage.buckets (id, name, public)
values ('raportti-kuvat', 'raportti-kuvat', true)
on conflict (id) do update set public = excluded.public;
