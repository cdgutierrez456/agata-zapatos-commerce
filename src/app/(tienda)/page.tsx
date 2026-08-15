import Image from "next/image";
import Link from "next/link";
import { supabase, imageUrl, one } from "@/lib/supabase";
import { finalPrice, price } from "@/lib/format";
import { WHATSAPP_TEXTO, REDES, whatsappUrl } from "@/lib/contacto";
import { rangoGlobal, rangoTallas } from "@/lib/tallas";

const guiaTallas = [
  { eu: "35", cm: "22,5 cm", uk: "2½" },
  { eu: "36", cm: "23,1 cm", uk: "3½" },
  { eu: "37", cm: "23,8 cm", uk: "4" },
  { eu: "38", cm: "24,4 cm", uk: "5" },
  { eu: "39", cm: "25,1 cm", uk: "6" },
  { eu: "40", cm: "25,7 cm", uk: "6½" },
  { eu: "41", cm: "26,4 cm", uk: "7½" },
  { eu: "42", cm: "27,0 cm", uk: "8" },
];

const marquesina = ["Nueva temporada", "Hecho para caminar", "Piel seleccionada", "Pedidos por WhatsApp"];

const saludo = whatsappUrl("Hola Ágata, me interesa un par de vuestro catálogo.");

export default async function Home({ searchParams }: PageProps<"/">) {
  const { categoria } = await searchParams;
  const db = await supabase();

  let query = db
    .from("products")
    .select(
      "id, name, slug, price, discount_percent, images(path, position), variants(label, position), categories(name, slug)",
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (typeof categoria === "string") {
    const { data: cat } = await db.from("categories").select("id").eq("slug", categoria).single();
    query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
  }

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    db.from("categories").select("name, slug").order("position"),
  ]);

  const catalogo = products ?? [];
  const portada = catalogo.find((p) => p.images.length);
  const portadaSrc = portada && imageUrl(portada.images.sort((a, b) => a.position - b.position)[0].path);

  // Las tres cifras de la portada salen del catálogo, no de una constante:
  // si mañana solo hay tallas 36–40 el hero lo dice.
  const tallas = rangoGlobal(catalogo.flatMap((p) => p.variants));

  const destacados = catalogo.slice(0, 3);

  return (
    <>
      {/* ── Portada ─────────────────────────────────────────────────────── */}
      <section id="inicio" className="relative overflow-hidden bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:min-h-[660px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="animate-rise py-20 lg:py-24">
            <p className="font-script text-2xl text-brand-soft sm:text-3xl">Calzado de mujer</p>
            <h1 className="mt-3 font-serif text-[clamp(3rem,6vw,5.75rem)] leading-[0.95] font-normal tracking-[-0.015em] text-pretty">
              Cada paso deja
              <br />
              <em className="text-brand-soft">tu firma</em>
            </h1>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed font-light text-paper/70">
              Tacones, sandalias y plataformas seleccionados pieza a pieza. Piel, brillo y una horma
              que se olvida de que la llevas puesta.
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <a href="#catalogo" className="pill bg-brand text-white hover:bg-brand-soft">
                Ver catálogo
              </a>
              <a
                href={saludo}
                target="_blank"
                rel="noopener noreferrer"
                className="pill border border-paper/35 text-paper hover:border-brand-soft hover:text-brand-soft"
              >
                Pedir por WhatsApp
              </a>
            </div>

            <dl className="mt-14 flex flex-wrap gap-x-9 gap-y-6 border-t border-white/10 pt-7 sm:gap-x-11">
              {[
                { valor: tallas, nombre: "Tallas" },
                { valor: String(catalogo.length), nombre: "Modelos" },
                { valor: "Nacional", nombre: "Envíos" },
              ].map((s) => (
                <div key={s.nombre}>
                  <dd className="font-serif text-3xl">{s.valor}</dd>
                  <dt className="mt-1 text-[0.7rem] tracking-[0.18em] text-paper/50 uppercase">
                    {s.nombre}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* El diagonal del diseño: bloque magenta detrás y la foto recortada
              con el mismo ángulo, un poco desplazada. */}
          <div className="relative hidden h-[660px] lg:block">
            <div
              className="absolute inset-0 bg-brand"
              style={{ clipPath: "polygon(18% 0,100% 0,100% 100%,0 100%)" }}
            />
            {portadaSrc && (
              <Image
                src={portadaSrc}
                alt={portada!.name}
                fill
                sizes="45vw"
                priority
                className="object-cover"
                style={{ clipPath: "polygon(24% 0,100% 0,100% 100%,6% 100%)" }}
              />
            )}
            <Image
              src="/logo-agata.png"
              alt=""
              width={150}
              height={150}
              className="absolute bottom-10 -left-14 opacity-90"
            />
          </div>
        </div>
      </section>

      {/* ── Marquesina ──────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-brand py-4 text-white">
        {/* La lista va dos veces: el -50% del keyframe deja el segundo juego
            exactamente donde empezaba el primero, sin salto visible. */}
        <div className="animate-marquee flex w-max gap-14 text-[0.8rem] tracking-[0.28em] whitespace-nowrap uppercase">
          {[...marquesina, ...marquesina, ...marquesina, ...marquesina].map((t, i) => (
            <span key={i} aria-hidden={i >= marquesina.length}>
              {t} ·
            </span>
          ))}
        </div>
      </div>

      {/* ── Colección destacada ─────────────────────────────────────────── */}
      {destacados.length > 0 && (
        <section id="coleccion" className="mx-auto max-w-7xl px-6 pt-24 pb-10 sm:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="label !text-brand">Colección destacada</p>
              <h2 className="mt-3 font-serif text-[clamp(2.25rem,4.4vw,3.75rem)] leading-none font-normal">
                Lo último que llegó
              </h2>
            </div>
            <p className="max-w-[38ch] text-[1.0625rem] leading-relaxed font-light text-muted">
              Stock corto y numerado. Si te gusta un par, escríbenos y lo reservamos por 48 horas.
            </p>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((p) => {
              const cover = p.images.sort((a, b) => a.position - b.position)[0];
              const category = one(p.categories);
              return (
                <li key={p.id} className="border border-line bg-surface">
                  <Link href={`/producto/${p.slug}`} className="group block">
                    <div className="relative aspect-4/5 overflow-hidden bg-wash">
                      {cover ? (
                        <Image
                          src={imageUrl(cover.path)}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-5 transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-faint">
                          Sin imagen
                        </div>
                      )}
                      <span className="absolute top-4 left-4 bg-ink px-3 py-1.5 text-[0.6875rem] tracking-[0.18em] text-paper uppercase">
                        {p.discount_percent > 0 ? `−${p.discount_percent}%` : "Nuevo"}
                      </span>
                    </div>

                    <div className="px-6 pt-6 pb-7">
                      <h3 className="font-serif text-2xl font-normal">{p.name}</h3>
                      <p className="mt-2 text-[0.9375rem] font-light text-muted">
                        {[category?.name, rangoTallas(p.variants)].filter(Boolean).join(" · ")}
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-lg font-medium text-brand tabular-nums">
                          {p.discount_percent > 0 ? (
                            <>
                              <span className="mr-2 text-sm font-light text-faint line-through">
                                {price(p.price)}
                              </span>
                              {price(finalPrice(p.price, p.discount_percent))}
                            </>
                          ) : (
                            price(p.price)
                          )}
                        </span>
                        <span className="border-b border-brand pb-0.5 text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
                          Reservar
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Catálogo ────────────────────────────────────────────────────── */}
      <section id="catalogo" className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:px-8">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
          <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-normal">Catálogo completo</h2>

          {/* Los filtros siguen siendo enlaces con ?categoria=: sin JS, con URL
              compartible y con el ancla para no volver arriba al filtrar. */}
          <div className="flex flex-wrap gap-2.5">
            {[{ name: "Todos", slug: null }, ...(categories ?? [])].map((c) => {
              const activo = (categoria ?? null) === c.slug;
              return (
                <Link
                  key={c.slug ?? "todos"}
                  href={c.slug ? `/?categoria=${c.slug}#catalogo` : "/#catalogo"}
                  aria-current={activo ? "page" : undefined}
                  className={`rounded-full border px-4.5 py-2.5 text-[0.6875rem] tracking-[0.16em] uppercase transition-colors ${
                    activo
                      ? "border-brand bg-brand text-white"
                      : "border-line text-muted hover:border-brand hover:text-brand"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>

        {!catalogo.length ? (
          <p className="py-20 text-center text-sm text-muted">
            Todavía no hay productos publicados en esta categoría.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {catalogo.map((p) => {
              const cover = p.images.sort((a, b) => a.position - b.position)[0];
              const category = one(p.categories);
              return (
                <li key={p.id} className="border border-line bg-surface">
                  <Link href={`/producto/${p.slug}`} className="group block">
                    {/* Mismo criterio que la ficha: contain para no recortar.
                        Las fotos vienen con encuadres distintos y el recorte
                        se comía los tacones. */}
                    <div className="relative aspect-4/5 overflow-hidden bg-wash">
                      {cover ? (
                        <Image
                          src={imageUrl(cover.path)}
                          alt={p.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-4 transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-faint">
                          Sin imagen
                        </div>
                      )}
                      {p.discount_percent > 0 && (
                        <span className="absolute top-3 left-3 bg-ink px-2 py-1 text-[0.625rem] tracking-[0.14em] text-paper uppercase">
                          −{p.discount_percent}%
                        </span>
                      )}
                    </div>

                    <div className="px-4.5 pt-4 pb-5">
                      <div className="text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
                        {category?.name ?? "Ágata"}
                      </div>
                      <h3 className="mt-1.5 font-serif text-[1.375rem] leading-tight font-normal">
                        {p.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="tabular-nums">
                          {p.discount_percent > 0 ? (
                            <>
                              <span className="mr-2 text-sm text-faint line-through">
                                {price(p.price)}
                              </span>
                              {price(finalPrice(p.price, p.discount_percent))}
                            </>
                          ) : (
                            price(p.price)
                          )}
                        </span>
                        <span className="text-[0.8125rem] font-light text-faint">
                          {rangoTallas(p.variants)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Sobre Ágata ─────────────────────────────────────────────────── */}
      <section id="sobre" className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid aspect-square place-items-center bg-brand">
            <Image
              src="/logo-agata.png"
              alt="Logotipo Ágata"
              width={480}
              height={480}
              className="h-auto w-[76%]"
            />
          </div>

          <div>
            <p className="label !text-brand-soft">Sobre Ágata</p>
            <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,3.375rem)] leading-[1.05] font-normal">
              Empezó por un par
              <br />
              que no existía
            </h2>
            <p className="mt-7 max-w-[54ch] text-lg leading-[1.75] font-light text-paper/75">
              Buscábamos un tacón que aguantara una boda entera y una sandalia que sirviera para el
              paseo y para la cena. Como no lo encontramos, lo montamos nosotras: selección corta,
              piel de verdad y una prueba de horma antes de que cualquier modelo entre en el
              catálogo.
            </p>
            <p className="mt-5 max-w-[54ch] text-lg leading-[1.75] font-light text-paper/75">
              Hoy Ágata es una tienda pequeña con nombre propio: te atendemos por WhatsApp, te
              decimos si esa talla te va a apretar y te acompañamos hasta que el par llegue a tu
              puerta.
            </p>

            <div className="mt-11 grid gap-6 sm:grid-cols-3">
              {[
                { titulo: "Piel", texto: "Materiales elegidos a mano" },
                { titulo: "Horma", texto: "Probada antes de venderla" },
                { titulo: "Trato", texto: "Te respondemos tú a tú" },
              ].map((c) => (
                <div key={c.titulo} className="border-t border-white/15 pt-4">
                  <div className="font-script text-2xl text-brand-soft">{c.titulo}</div>
                  <p className="mt-1.5 text-sm font-light text-paper/60">{c.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Guía de tallas ──────────────────────────────────────────────── */}
      <section id="tallas" className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        {/* min-w-0: sin esto la tabla impone su ancho mínimo a la columna del
            grid y arrastra toda la página a scroll horizontal en móvil. */}
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.15fr] [&>*]:min-w-0">
          <div>
            <p className="label !text-brand">Guía de tallas</p>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3.375rem)] leading-[1.05] font-normal">
              Mide una vez,
              <br />
              acierta siempre
            </h2>
            <ol className="mt-8 list-decimal pl-6 text-[1.0625rem] leading-[1.8] font-light text-muted">
              <li>Apoya el pie sobre un folio, de pie, al final del día.</li>
              <li>Marca el talón y el dedo más largo.</li>
              <li>Mide la distancia en centímetros y búscala en la tabla.</li>
            </ol>
            <p className="mt-7 border-l-[3px] border-brand bg-wash px-6 py-5 text-base leading-relaxed font-light text-muted">
              Entre dos tallas, sube a la mayor en tacón cerrado y quédate en la menor en sandalia.
            </p>
            <a
              href={whatsappUrl("Hola Ágata, tengo dudas con mi talla. ¿Me ayudan a elegir?")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block border-b border-brand pb-1 text-[0.8125rem] tracking-[0.16em] text-brand uppercase"
            >
              Dudas con tu talla, escríbenos
            </a>
          </div>

          {/* La tabla no baja de sus ~400px de ancho mínimo: en móvil se
              desplaza dentro de su caja en vez de empujar toda la página. */}
          <div className="overflow-x-auto border border-line bg-surface">
            <table className="w-full text-left">
            <thead>
              <tr className="bg-ink text-[0.75rem] tracking-[0.16em] text-paper uppercase">
                <th scope="col" className="px-6 py-4 font-normal">
                  Talla EU
                </th>
                <th scope="col" className="px-6 py-4 font-normal">
                  Largo del pie
                </th>
                <th scope="col" className="px-6 py-4 font-normal">
                  Equiv. UK
                </th>
              </tr>
            </thead>
            <tbody className="text-[1.0625rem] font-light text-muted">
                {guiaTallas.map((t) => (
                  <tr key={t.eu} className="border-b border-line last:border-0">
                    <th scope="row" className="px-6 py-4 font-medium text-ink">
                      {t.eu}
                    </th>
                    <td className="px-6 py-4">{t.cm}</td>
                    <td className="px-6 py-4">{t.uk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Contacto ────────────────────────────────────────────────────── */}
      <section id="contacto" className="bg-brand text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-serif text-[clamp(2.25rem,4.4vw,3.625rem)] leading-[1.02] font-normal">
              Cuéntanos qué par
              <br />
              buscas
            </h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed font-light text-white/85">
              Escríbenos por WhatsApp con el modelo y tu talla. Te confirmamos disponibilidad, fotos
              reales y cómo hacemos el envío.
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <a
                href={saludo}
                target="_blank"
                rel="noopener noreferrer"
                className="pill bg-ink text-white hover:bg-white hover:text-brand"
              >
                Abrir WhatsApp
              </a>
              <a
                href={REDES.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="pill border border-white/50 text-white hover:bg-white hover:text-brand"
              >
                Ver Instagram
              </a>
            </div>
          </div>

          <dl className="grid gap-6 bg-ink/25 p-9">
            <div>
              <dt className="text-[0.7rem] tracking-[0.2em] text-white/60 uppercase">WhatsApp</dt>
              <dd className="mt-1.5 font-serif text-[1.75rem]">
                <a href={saludo} target="_blank" rel="noopener noreferrer" className="text-white">
                  {WHATSAPP_TEXTO}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] tracking-[0.2em] text-white/60 uppercase">Horario</dt>
              <dd className="mt-1.5 text-lg font-light">Lun a sáb · 10:00 – 20:30</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] tracking-[0.2em] text-white/60 uppercase">Envíos</dt>
              <dd className="mt-1.5 text-lg font-light">A todo el país · consúltanos el costo</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
