import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, imageUrl } from "@/lib/supabase";
import {
  updateProduct,
  deleteProduct,
  saveVariant,
  deleteVariant,
  uploadImage,
  deleteImage,
} from "../../actions";
import { ProductFields } from "../fields";
import { Alerta, MENSAJES } from "../../alerta";
import { Enviar } from "../../enviar";

export default async function EditarProducto({
  params,
  searchParams,
}: PageProps<"/admin/productos/[id]">) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const db = await supabase();

  const [{ data: product }, { data: categories }] = await Promise.all([
    db
      .from("products")
      .select(
        "id, name, slug, category_id, description, price, discount_percent, active, images(id, path, position), variants(id, label, stock, position)",
      )
      .eq("id", id)
      .single(),
    db.from("categories").select("id, name").order("position"),
  ]);

  if (!product) notFound();

  const images = product.images.sort((a, b) => a.position - b.position);
  const variants = product.variants.sort((a, b) => a.position - b.position);

  return (
    <>
      <Link href="/admin" className="label hover:text-ink">
        ← Productos
      </Link>

      <div className="mt-6 flex items-center justify-between border-b border-line pb-4">
        <h1 className="text-xl font-light tracking-tight">{product.name}</h1>
        <Link href={`/producto/${product.slug}`} className="label hover:text-ink">
          Ver en tienda ↗
        </Link>
      </div>

      {ok && (
        <Alerta volverA={`/admin/productos/${product.id}`}>{MENSAJES[String(ok)] ?? "Listo."}</Alerta>
      )}
      {error && (
        <Alerta tono="error" volverA={`/admin/productos/${product.id}`}>
          {error}
        </Alerta>
      )}

      {/* ---------------------------------------------------------- datos */}
      {/* El botón de guardar vive al final de la página, fuera de este form.
          El atributo form="..." de HTML los une por id: sin JS y sin tener
          que anidar formularios, que además es inválido. */}
      <form id="datos-producto" action={updateProduct} className="mt-8">
        <input type="hidden" name="id" value={product.id} />
        <ProductFields categories={categories ?? []} product={product} />
      </form>

      {/* ------------------------------------------------------- variantes */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="label">Stock</h2>
        <p className="mt-2 max-w-lg text-xs text-faint">
          Deja la talla vacía para un producto sin tallas (un reloj). Agrega una fila por talla
          cuando sí las tenga (S, M, L…).
        </p>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {variants.map((v) => (
            <li key={v.id}>
              <form action={saveVariant} className="flex flex-wrap items-center gap-2 py-3">
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="product_id" value={product.id} />
                <input
                  className="field w-28"
                  name="label"
                  defaultValue={v.label ?? ""}
                  placeholder="Sin talla"
                />
                <input
                  className="field w-24"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={v.stock}
                />
                <input
                  className="field w-20"
                  name="position"
                  type="number"
                  defaultValue={v.position}
                  title="Orden"
                />
                {/* Botón sólido: en gris de "label" se leía como texto muerto
                    y el stock se quedaba sin guardar. */}
                <Enviar
                  cargando="Guardando…"
                  className="bg-ink px-4 py-2.5 text-xs tracking-[0.14em] text-paper uppercase transition-opacity hover:opacity-80"
                >
                  Guardar
                </Enviar>
                <button
                  formAction={deleteVariant}
                  className="label ml-auto hover:text-ink"
                  disabled={variants.length === 1}
                >
                  Eliminar
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={saveVariant} className="flex flex-wrap items-center gap-2 pt-4">
          <input type="hidden" name="product_id" value={product.id} />
          <input className="field w-28" name="label" placeholder="Talla" />
          <input className="field w-24" name="stock" type="number" min="0" placeholder="Stock" />
          <input
            className="field w-20"
            name="position"
            type="number"
            defaultValue={variants.length}
          />
          <Enviar
            cargando="Agregando…"
            className="border border-ink px-4 py-2.5 text-xs tracking-[0.14em] uppercase transition-colors hover:bg-ink hover:text-paper"
          >
            + Agregar talla
          </Enviar>
        </form>
      </section>

      {/* --------------------------------------------------------- imágenes */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="label">Imágenes</h2>


        <ul className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
          {images.map((img) => (
            <li key={img.id}>
              <div className="relative aspect-[4/5] overflow-hidden bg-wash">
                <Image src={imageUrl(img.path)} alt="" fill sizes="20vw" className="object-cover" />
              </div>
              <form action={deleteImage}>
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="path" value={img.path} />
                <button className="label mt-2 hover:text-ink">Eliminar</button>
              </form>
            </li>
          ))}
        </ul>

        <form action={uploadImage} className="mt-6 flex flex-wrap items-center gap-3">
          <input type="hidden" name="product_id" value={product.id} />
          <input
            className="field max-w-xs file:mr-3 file:border-0 file:bg-transparent file:text-xs"
            type="file"
            name="file"
            accept="image/*"
            required
          />
          {/* Botón sólido, no un enlace gris: es un formulario aparte del de
              arriba y "Guardar cambios" NO sube la imagen. */}
          <Enviar
            cargando="Subiendo imagen…"
            className="bg-ink px-5 py-2.5 text-xs tracking-[0.14em] text-paper uppercase transition-opacity hover:opacity-80"
          >
            Subir imagen
          </Enviar>
          <span className="w-full text-xs text-faint">
            Elige el archivo y pulsa <strong className="font-medium">Subir imagen</strong>. Máx. 8
            MB: una foto de celular sin comprimir suele pasarse. Sube WebP de ~1200px.
          </span>
        </form>
        {/* ponytail: el orden se edita con el campo "position" de cada fila.
            Drag & drop cuando el catálogo tenga suficientes fotos para dolerte. */}
      </section>

      {/* --------------------------------------------------------- eliminar */}
      {/* --------------------------------------------------------- guardar */}
      <div className="mt-14 border-t border-line pt-8">
        <button
          form="datos-producto"
          className="bg-ink px-6 py-2.5 text-xs tracking-[0.14em] text-paper uppercase transition-opacity hover:opacity-80"
        >
          Guardar cambios
        </button>
        <p className="mt-3 text-xs text-faint">
          Guarda los datos del producto y vuelve a la lista. El stock y las imágenes ya se
          guardaron con sus propios botones.
        </p>
      </div>

      {/* <details> nativo: dos clics para borrar, cero JavaScript. El rojo solo
          aparece al abrirlo, cuando el botón ya es de verdad. */}
      <details className="mt-14 border-t border-line pt-8">
        <summary className="label w-fit cursor-pointer marker:text-faint hover:text-ink">
          Eliminar producto
        </summary>
        <form action={deleteProduct} className="mt-5">
          <input type="hidden" name="id" value={product.id} />
          <button className="border border-danger px-5 py-2.5 text-xs tracking-[0.14em] text-danger uppercase transition-colors hover:bg-danger hover:text-paper">
            Sí, eliminar definitivamente
          </button>
          <p className="mt-3 max-w-md text-xs text-muted">
            Borra «{product.name}», sus {variants.length}{" "}
            {variants.length === 1 ? "variante" : "variantes"} y sus {images.length}{" "}
            {images.length === 1 ? "imagen" : "imágenes"}. No se puede deshacer.
          </p>
        </form>
      </details>
    </>
  );
}
