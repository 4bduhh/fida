-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run any time (everything uses "if not exists" / "or replace").

create extension if not exists pgcrypto;

-- 1) Base tables (created only if they don't already exist) -----------------

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  whatsapp text,
  company text,
  email text,
  product text,
  quantity text,
  location text,
  message text,
  source text,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  category text,
  material text,
  description text,
  image_url text,
  image2_url text,
  applications text[],
  is_published boolean default true,
  created_at timestamptz default now()
);

-- 2) Make sure every column the site/admin needs exists ---------------------

alter table public.enquiries add column if not exists whatsapp text;
alter table public.enquiries add column if not exists company text;
alter table public.enquiries add column if not exists email text;
alter table public.enquiries add column if not exists quantity text;
alter table public.enquiries add column if not exists location text;
alter table public.enquiries add column if not exists message text;
alter table public.enquiries add column if not exists source text;
alter table public.enquiries add column if not exists status text default 'new';
alter table public.enquiries add column if not exists created_at timestamptz default now();

alter table public.products add column if not exists image2_url text;

-- 3) Row Level Security ------------------------------------------------------

alter table public.enquiries enable row level security;
alter table public.products enable row level security;

drop policy if exists "Admin read enquiries" on public.enquiries;
create policy "Admin read enquiries" on public.enquiries for select using (true);

drop policy if exists "Public submit enquiries" on public.enquiries;
create policy "Public submit enquiries" on public.enquiries for insert with check (true);

drop policy if exists "Admin update enquiries" on public.enquiries;
create policy "Admin update enquiries" on public.enquiries for update using (true);

drop policy if exists "Admin delete enquiries" on public.enquiries;
create policy "Admin delete enquiries" on public.enquiries for delete using (true);

drop policy if exists "Admin read all products" on public.products;
create policy "Admin read all products" on public.products for select using (true);

drop policy if exists "Admin insert products" on public.products;
create policy "Admin insert products" on public.products for insert with check (true);

drop policy if exists "Admin update products" on public.products;
create policy "Admin update products" on public.products for update using (true);

drop policy if exists "Admin delete products" on public.products;
create policy "Admin delete products" on public.products for delete using (true);

-- 4) Storage bucket for product images --------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images" on storage.objects for insert with check (bucket_id = 'product-images');

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images" on storage.objects for update using (bucket_id = 'product-images');

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images" on storage.objects for delete using (bucket_id = 'product-images');