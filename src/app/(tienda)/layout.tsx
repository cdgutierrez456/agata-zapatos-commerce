import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { REDES, whatsappUrl } from "@/lib/contacto";
import { IconoFacebook, IconoInstagram, IconoWhatsApp } from "./iconos";

const saludo = whatsappUrl("Hola Ágata, me interesa un par de vuestro catálogo.");

// Los anclas van con "/" delante para que también funcionen desde la ficha de
// producto, donde la portada no está montada.
const navegacion = [
  { nombre: "Colección", href: "/#coleccion" },
  { nombre: "Catálogo", href: "/#catalogo" },
  { nombre: "Sobre Ágata", href: "/#sobre" },
  { nombre: "Tallas", href: "/#tallas" },
];

const redes = [
  { nombre: "WhatsApp", url: saludo, icono: <IconoWhatsApp /> },
  { nombre: "Instagram", url: REDES.instagram, icono: <IconoInstagram /> },
  { nombre: "Facebook", url: REDES.facebook, icono: <IconoFacebook /> },
];

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const db = await supabase();
  // Solo decide si se pinta el enlace al panel. Quien proteja /admin es el
  // proxy y las policies RLS, no este if.
  const { data: session } = await db.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3.5 sm:gap-10 sm:px-8">
          <Link href="/" aria-label="Ágata — inicio" className="shrink-0">
            <Image src="/logo-agata.png" alt="Ágata" width={44} height={44} priority />
          </Link>

          <div className="ml-auto hidden gap-7 text-[0.8rem] tracking-[0.14em] uppercase lg:flex">
            {navegacion.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-paper/90 transition-colors hover:text-brand-soft"
              >
                {n.nombre}
              </Link>
            ))}
          </div>

          {/* En móvil el bloque de nav está oculto, así que este ml-auto es el
              que empuja el CTA a la derecha; en desktop lo hace el de la nav. */}
          <div className="ml-auto flex shrink-0 items-center gap-5 lg:ml-0">
            {session.user && (
              <Link
                href="/admin"
                className="text-[0.7rem] tracking-[0.2em] text-paper/50 uppercase transition-colors hover:text-brand-soft"
              >
                Panel ↗
              </Link>
            )}

            <a
              href={saludo}
              target="_blank"
              rel="noopener noreferrer"
              className="pill bg-brand !px-5 !py-3 text-white hover:bg-brand-soft"
            >
              WhatsApp
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-ink text-paper/60">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-8 border-b border-white/10 pb-10">
            <Image src="/logo-agata.png" alt="Ágata" width={56} height={56} />

            <div className="flex flex-wrap gap-6 text-[0.8rem] tracking-[0.14em] uppercase">
              {navegacion.map((n) => (
                <Link key={n.href} href={n.href} className="transition-colors hover:text-brand-soft">
                  {n.nombre}
                </Link>
              ))}
            </div>

            <ul className="flex gap-2">
              {redes.map((r) => (
                <li key={r.nombre}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={r.nombre}
                    title={r.nombre}
                    className="grid size-11 place-items-center rounded-full border border-white/20 transition-colors hover:border-brand-soft hover:text-brand-soft"
                  >
                    {r.icono}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-xs font-light">
            {/* La página es dinámica, así que el año se calcula en cada petición
                y no se queda congelado en el del último despliegue. */}
            {/* Entrada discreta al panel: sin subrayado, color ni hover propios.
                No es una medida de seguridad —de eso se encargan el login y
                RLS—, solo evita el enlace "Admin" a la vista de todos. */}
            <p>
              © {new Date().getFullYear()}{" "}
              <Link href="/login" aria-label="Panel administrativo" className="text-inherit">
                Ágata
              </Link>{" "}
              · Calzado de mujer
            </p>

            <p>Precios de referencia. Consulta disponibilidad antes de comprar.</p>

            <p>
              By{" "}
              <a
                href="https://scaleautomatization.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper/80 underline underline-offset-4 transition-colors hover:text-brand-soft"
              >
                Scale Automatization
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
