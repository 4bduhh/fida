-- Run this once in Supabase SQL Editor. RLS allows public visitors to submit enquiries only.
create extension if not exists "pgcrypto";
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
  category text not null, description text, material text, specifications jsonb default '{}'::jsonb,
  applications text[] default '{}', image_url text, is_published boolean default true, created_at timestamptz default now()
);
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(), name text not null, company text, email text not null,
  phone text, product text, quantity text, location text, message text, status text default 'new', source text, created_at timestamptz default now()
);
create table if not exists public.resources (id uuid primary key default gen_random_uuid(), title text not null, resource_type text not null, file_url text, description text, is_published boolean default true, created_at timestamptz default now());
create table if not exists public.certifications (id uuid primary key default gen_random_uuid(), title text not null, issuer text, file_url text, valid_until date, is_published boolean default true, created_at timestamptz default now());
alter table public.products enable row level security; alter table public.enquiries enable row level security; alter table public.resources enable row level security; alter table public.certifications enable row level security;
create policy "Public products" on public.products for select using (is_published = true);
create policy "Public resources" on public.resources for select using (is_published = true);
create policy "Public certifications" on public.certifications for select using (is_published = true);
create policy "Public enquiry submission" on public.enquiries for insert with check (true);
-- Create admin accounts in Supabase Auth, then add authenticated CRUD policies after assigning staff roles.
