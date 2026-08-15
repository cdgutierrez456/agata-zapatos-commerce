import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, imageUrl, one } from "@/lib/supabase";
import { finalPrice, price } from "@/lib/format";
import { Galeria } from "./galeria";
import { Contacto } from "./contacto";

export default async function Producto({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const db = await supabase();

  const { data: product } = await db
    .from("products")
    .select(
      "id, name, description, price, discount_percent, images(path, position), variants(label, stock, position), categories(name, slug)",
    )
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!product) notFound();

  const images = product.images.sort((a, b) => a.position - b.position);
  // Un producto sin tallas es una sola variante con label null.
  const variants = product.variants.sort((a, b) => a.position - b.position);
  const category = one(product.categories);

  return (
    <article className="mx-auto grid max-w-6xl gap-12 px-6 py-14 sm:px-8 lg:grid-cols-2 lg:gap-16">
      <div>
        {images.length ? (
          <Galeria images={images.map((img) => imageUrl(img.path))} alt={product.name} />
        ) : (
          <div className="grid aspect-4/5 place-items-center border border-line bg-wash text-xs text-faint">
            Sin imagen
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <Link
          href="/#catalogo"
          className="text-[0.75rem] tracking-[0.16em] text-muted uppercase transition-colors hover:text-brand"
        >
          ← Volver al catálogo
        </Link>

        {category && (
          <p className="mt-8 text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {category.name}
          </p>
        )}
        <h1 className="mt-2 font-serif text-[clamp(2rem,4vw,2.75rem)] leading-tight font-normal">
          {product.name}
        </h1>

        <p className="mt-5 flex flex-wrap items-baseline gap-3 text-2xl text-brand tabular-nums">
          {product.discount_percent > 0 ? (
            <>
              <span className="text-lg font-light text-faint line-through">
                {price(product.price)}
              </span>
              <span>{price(finalPrice(product.price, product.discount_percent))}</span>
              <span className="bg-ink px-2.5 py-1 text-[0.625rem] tracking-[0.14em] text-paper uppercase">
                −{product.discount_percent}%
              </span>
            </>
          ) : (
            price(product.price)
          )}
        </p>

        {product.description && (
          <p className="mt-8 border-t border-line pt-8 text-[0.9375rem] leading-relaxed font-light whitespace-pre-line text-muted">
            {product.description}
          </p>
        )}

        {/* La lista de tallas ahora es el selector: mostrarlas y volver a
            pedirlas en un desplegable aparte sería la misma info dos veces. */}
        <Contacto
          nombre={product.name}
          categoria={category?.name ?? null}
          precioLista={Number(product.price)}
          precioFinal={finalPrice(product.price, product.discount_percent)}
          descuento={product.discount_percent}
          variantes={variants}
        />
      </div>
    </article>
  );
}
