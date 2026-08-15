-- Marca blanca — esquema del catálogo
-- Pegar completo en Supabase Studio → SQL Editor → Run

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tablas

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references categories(id) on delete set null,
  name           text not null,
  slug           text not null unique,
  description    text,
  price          numeric(12,2) not null check (price >= 0),
  -- 0 = sin descuento. Se guarda el porcentaje, no el precio rebajado: el
  -- precio final se calcula al mostrar. Guardar los dos obliga a recalcular
  -- uno cada vez que cambia el otro, y tarde o temprano se desincronizan.
  discount_percent int not null default 0 check (discount_percent between 0 and 100),
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists products_category_idx on products (category_id);

-- Stock SIEMPRE vive aquí, nunca en products.
-- Un reloj = 1 variante con label null. Una camisa = N variantes con talla.
-- Un solo camino de stock: una query, una UI, un solo lugar donde descontar.
create table if not exists variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label      text,
  stock      int  not null default 0 check (stock >= 0),
  position   int  not null default 0
);

create unique index if not exists variants_one_unlabeled
  on variants (product_id) where label is null;
create unique index if not exists variants_label_unique
  on variants (product_id, label) where label is not null;

create table if not exists images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  path       text not null,
  position   int  not null default 0
);

create index if not exists images_product_idx on images (product_id, position);

-- ------------------------------------------------------------------ RLS
-- Un solo admin: "estar autenticado" ES el permiso. Sin tabla de roles.

alter table categories enable row level security;
alter table products   enable row level security;
alter table variants   enable row level security;
alter table images     enable row level security;

drop policy if exists categories_read  on categories;
drop policy if exists categories_write on categories;
create policy categories_read  on categories for select using (true);
create policy categories_write on categories for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- El público solo ve productos activos; el admin ve todo.
drop policy if exists products_read  on products;
drop policy if exists products_write on products;
create policy products_read  on products for select
  using (active or auth.uid() is not null);
create policy products_write on products for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists variants_read  on variants;
drop policy if exists variants_write on variants;
create policy variants_read  on variants for select using (true);
create policy variants_write on variants for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists images_read  on images;
drop policy if exists images_write on images;
create policy images_read  on images for select using (true);
create policy images_write on images for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- -------------------------------------------------------------- storage

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists product_images_list   on storage.objects;
drop policy if exists product_images_manage on storage.objects;

-- El bucket es público: las imágenes se sirven por la URL del CDN sin pasar
-- por RLS. Esta policy no las muestra, solo permite listar la carpeta, que es
-- lo que necesita deleteProduct() para limpiar los archivos. Por eso exige
-- sesión: sin el filtro, cualquiera podría enumerar el bucket entero.
create policy product_images_list on storage.objects for select
  using (bucket_id = 'products' and auth.uid() is not null);
create policy product_images_manage on storage.objects for all
  using (bucket_id = 'products' and auth.uid() is not null)
  with check (bucket_id = 'products' and auth.uid() is not null);

-- ----------------------------------------------------------- datos demo

insert into categories (name, slug, position) values
  ('Relojes',   'relojes',   1),
  ('Camisas',   'camisas',   2),
  ('Accesorios','accesorios',3)
on conflict (slug) do nothing;
