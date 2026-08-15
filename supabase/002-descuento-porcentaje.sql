-- Tu base ya existe, así que schema.sql (que es para instalaciones nuevas) no
-- la actualiza. Pega esto en SQL Editor → Run.
--
-- discount_price (precio rebajado) → discount_percent (porcentaje 0-100).
-- Convierte los descuentos que ya tengas cargados antes de borrar la columna.

alter table products
  add column if not exists discount_percent int not null default 0;

update products
set discount_percent = round((1 - discount_price / price) * 100)
where discount_price is not null and price > 0;

alter table products
  drop constraint if exists discount_below_price,
  drop column if exists discount_price,
  add constraint discount_percent_range check (discount_percent between 0 and 100);
