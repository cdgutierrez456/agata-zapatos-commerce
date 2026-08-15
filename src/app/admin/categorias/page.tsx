import { supabase } from "@/lib/supabase";
import { createCategory, deleteCategory } from "../actions";
import { Alerta, MENSAJES } from "../alerta";

export default async function AdminCategorias({ searchParams }: PageProps<"/admin/categorias">) {
  const { ok, error } = await searchParams;
  const db = await supabase();
  const { data: categories } = await db
    .from("categories")
    .select("id, name, slug, products(count)")
    .order("position");

  return (
    <>
      <h1 className="border-b border-line pb-4 text-xl font-light tracking-tight">Categorías</h1>

      {ok && <Alerta volverA="/admin/categorias">{MENSAJES[String(ok)] ?? "Listo."}</Alerta>}
      {error && (
        <Alerta tono="error" volverA="/admin/categorias">
          {error}
        </Alerta>
      )}

      <form action={createCategory} className="flex flex-wrap gap-2 py-6">
        <input className="field flex-1" name="name" placeholder="Nombre de la categoría" required />
        <input className="field w-24" name="position" type="number" placeholder="Orden" />
        <button className="bg-ink px-5 text-xs tracking-[0.14em] text-paper uppercase transition-opacity hover:opacity-80">
          Agregar
        </button>
      </form>

      <ul className="divide-y divide-line border-t border-line">
        {categories?.map((c) => (
          <li key={c.id} className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm">{c.name}</p>
              <p className="label mt-1">
                /{c.slug} · {c.products[0]?.count ?? 0} productos
              </p>
            </div>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button className="label hover:text-ink">Eliminar</button>
            </form>
          </li>
        ))}
      </ul>

      {!categories?.length && (
        <p className="py-16 text-center text-sm text-muted">Sin categorías todavía.</p>
      )}
    </>
  );
}
