import Image from "next/image";
import Link from "next/link";
import { supabase, imageUrl, one } from "@/lib/supabase";
import { finalPrice, price } from "@/lib/format";
import { Alerta, MENSAJES } from "./alerta";

export default async function AdminProductos({ searchParams }: PageProps<"/admin">) {
  const { ok, error } = await searchParams;
  const db = await supabase();
  const { data: products } = await db
    .from("products")
    .select("id, name, price, discount_percent, active, images(path, position), variants(stock), categories(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="text-xl font-light tracking-tight">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-ink px-4 py-2 text-xs tracking-[0.14em] text-paper uppercase transition-opacity hover:opacity-80"
        >
          Nuevo
        </Link>
      </div>

      {ok && <Alerta volverA="/admin">{MENSAJES[String(ok)] ?? "Listo."}</Alerta>}
      {error && (
        <Alerta tono="error" volverA="/admin">
          {error}
        </Alerta>
      )}

      {!products?.length ? (
        <p className="py-24 text-center text-sm text-muted">Aún no hay productos.</p>
      ) : (
        <ul className="divide-y divide-line">
          {products.map((p) => {
            const cover = p.images.sort((a, b) => a.position - b.position)[0];
            const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/productos/${p.id}`}
                  className="flex items-center gap-4 py-4 hover:bg-wash"
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-wash">
                    {cover && (
                      <Image
                        src={imageUrl(cover.path)}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{p.name}</p>
                    <p className="label mt-1">
                      {one(p.categories)?.name ?? "Sin categoría"} · {stock} en stock
                    </p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums">
                    {p.discount_percent > 0 ? (
                      <>
                        <span className="mr-2 text-faint line-through">{price(p.price)}</span>
                        {price(finalPrice(p.price, p.discount_percent))}
                        <span className="ml-2 text-xs text-muted">−{p.discount_percent}%</span>
                      </>
                    ) : (
                      price(p.price)
                    )}
                  </p>
                  <span
                    className={`ml-4 shrink-0 text-[0.625rem] tracking-[0.14em] uppercase ${
                      p.active ? "text-ink" : "text-faint"
                    }`}
                  >
                    {p.active ? "Visible" : "Oculto"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
