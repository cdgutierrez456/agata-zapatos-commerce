"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Único componente de cliente de la app. Cambiar de foto por query param
// costaría un viaje al servidor y a Supabase por clic; aquí es inmediato.
export function Galeria({ images, alt }: { images: string[]; alt: string }) {
  const [activa, setActiva] = useState(0);
  const lightbox = useRef<HTMLDialogElement>(null);

  return (
    <div>
      {/* object-contain, no cover: la foto entra completa y se centra sola en
          la caja. Recortar para llenar el contenedor perdía los bordes de
          prendas verticales. El borde deja ver dónde termina el contenedor. */}
      <button
        type="button"
        onClick={() => lightbox.current?.showModal()}
        aria-label="Ver imagen completa"
        className="relative block aspect-square w-full cursor-zoom-in border border-line bg-surface"
      >
        <Image
          src={images[activa]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-contain p-3"
          priority
        />
      </button>

      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActiva(i)}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-current={i === activa}
                className={`relative block aspect-square w-full border bg-surface transition-colors ${
                  i === activa ? "border-brand" : "border-line opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="15vw" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* <dialog> nativo: tecla Escape, foco atrapado y ::backdrop salen gratis.
          El m-auto es obligatorio: el reset de Tailwind borra el margin:auto
          con el que el navegador centra un dialog modal, y se va a la esquina. */}
      <dialog
        ref={lightbox}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/80"
      >
        <div
          onClick={() => lightbox.current?.close()}
          className="relative h-[92dvh] w-[92vw] cursor-zoom-out"
        >
          <Image src={images[activa]} alt={alt} fill sizes="92vw" className="object-contain" />

          <button
            type="button"
            onClick={() => lightbox.current?.close()}
            aria-label="Cerrar"
            className="absolute top-0 right-0 grid size-11 place-items-center bg-paper text-lg text-ink transition-opacity hover:opacity-80"
          >
            ✕
          </button>
        </div>
      </dialog>
    </div>
  );
}
