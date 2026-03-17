
-- Run this in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.marketing_candidates (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null,
  whatsapp text,
  location text,
  portfolio_url text,
  tiktok_url text,
  instagram_url text,
  current_stage text,
  device_score integer default 0,
  progress integer default 0,
  status text default 'Submitted',
  candidate_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_candidate_files (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.marketing_candidates(id) on delete cascade,
  file_key text not null,
  file_name text,
  file_path text,
  public_url text,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_candidate_reviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.marketing_candidates(id) on delete cascade,
  reviewer_name text,
  score_creativity integer,
  score_hook integer,
  score_editing integer,
  score_trend integer,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.marketing_candidates enable row level security;
alter table public.marketing_candidate_files enable row level security;
alter table public.marketing_candidate_reviews enable row level security;

-- Public insert policy so candidates can submit from your portal.
-- Tighten this later if you add auth or captcha.
drop policy if exists "public can insert marketing candidates" on public.marketing_candidates;
create policy "public can insert marketing candidates"
on public.marketing_candidates
for insert
to anon, authenticated
with check (true);

drop policy if exists "public can insert candidate files" on public.marketing_candidate_files;
create policy "public can insert candidate files"
on public.marketing_candidate_files
for insert
to anon, authenticated
with check (true);

-- HR/admin read access is best handled with service role inside Edge Functions.
-- Add your own authenticated admin policies later if needed.

insert into storage.buckets (id, name, public)
values ('marketing-candidate-files', 'marketing-candidate-files', true)
on conflict (id) do nothing;
