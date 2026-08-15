-- Cierra el aviso "Clients can list all files in this bucket".
--
-- El bucket es público: las imágenes se sirven por la URL del CDN, que no pasa
-- por RLS. La policy SELECT no las muestra, solo permite LISTAR el bucket.
-- Sin sesión, eso deja que cualquiera enumere los archivos.
--
-- No se borra, se restringe: deleteProduct() usa storage.list() para vaciar la
-- carpeta antes de borrar el producto, y sin SELECT esa limpieza falla callada
-- y deja archivos huérfanos ocupando cuota.

drop policy if exists product_images_read on storage.objects;

create policy product_images_list on storage.objects for select
  using (bucket_id = 'products' and auth.uid() is not null);
