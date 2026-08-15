import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createProduct } from "../../actions";
import { ProductFields } from "../fields";
import { Alerta } from "../../alerta";

export default async function NuevoProducto({ searchParams }: PageProps<"/admin/productos/nuevo">) {
  const { error } = await searchParams;
  const db = await supabase();
  const { data: categories } = await db.from("categories").select("id, name").order("position");

  return (
    <>
      <Link href="/admin" className="label hover:text-ink">
        ← Productos
      </Link>
      <h1 className="mt-6 border-b border-line pb-4 text-xl font-light tracking-tight">
        Nuevo producto
      </h1>

      {error && (
        <Alerta tono="error" volverA="/admin/productos/nuevo">
          {error}
        </Alerta>
      )}

      {!categories?.length ? (
        // Con la categoría obligatoria, sin categorías no hay producto posible.
        <p className="mt-8 border border-line bg-wash px-4 py-3 text-sm">
          Primero crea al menos una categoría en{" "}
          <Link href="/admin/categorias" className="underline underline-offset-4">
            Categorías
          </Link>
          .
        </p>
      ) : (
        <form action={createProduct} className="mt-8">
          <ProductFields categories={categories} />
          <button className="mt-8 bg-ink px-6 py-2.5 text-xs tracking-[0.14em] text-paper uppercase transition-opacity hover:opacity-80">
            Crear y continuar
          </button>
          <p className="mt-3 text-xs text-faint">
            Las imágenes y las tallas se agregan en el siguiente paso.
          </p>
        </form>
      )}
    </>
  );
}
