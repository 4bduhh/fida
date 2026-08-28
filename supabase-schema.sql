drop policy if exists "Admin read enquiries" on public.enquiries;
create policy "Admin read enquiries" on public.enquiries for select using (true);

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

alter table public.products add column if not exists image2_url text;

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