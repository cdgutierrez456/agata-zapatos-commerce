import Link from "next/link";

export const MENSAJES: Record<string, string> = {
  creado: "Producto creado. Abajo están el stock y las imágenes para terminarlo.",
  datos: "Cambios guardados.",
  imagen: "Imagen agregada.",
  stock: "Stock actualizado.",
  creada: "Categoría creada.",
  eliminada: "Categoría eliminada.",
};

// Modal a pantalla completa, sin sweetalert ni ninguna otra dependencia: el
// estado vive en la URL, así que no hace falta una sola línea de JavaScript
// de cliente. Se cierra navegando a la misma página sin el query param.
export function Alerta({
  tono = "ok",
  volverA,
  children,
}: {
  tono?: "ok" | "error";
  volverA: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-6">
      {/* El fondo es un enlace: clic fuera = cerrar, también sin JS. */}
      <Link href={volverA} aria-label="Cerrar" className="absolute inset-0 bg-ink/45" />

      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm border border-line bg-surface px-8 py-10 text-center shadow-2xl"
      >
        <span
          aria-hidden
          className={`mx-auto grid size-11 place-items-center rounded-full border text-lg ${
            tono === "ok" ? "border-ink" : "border-danger text-danger"
          }`}
        >
          {tono === "ok" ? "✓" : "!"}
        </span>

        <p className="mt-5 text-sm leading-relaxed break-words">{children}</p>

        <Link
          href={volverA}
          className={`mt-7 inline-block px-8 py-2.5 text-xs tracking-[0.14em] uppercase transition-opacity hover:opacity-80 ${
            tono === "ok" ? "bg-ink text-paper" : "bg-danger text-paper"
          }`}
        >
          Entendido
        </Link>
      </div>
    </div>
  );
}
