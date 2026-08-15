"use client";

import { useState } from "react";
import { price } from "@/lib/format";
import { whatsappUrl } from "@/lib/contacto";
import { IconoWhatsApp } from "../../iconos";

type Variante = { label: string | null; stock: number };

export function Contacto({
  nombre,
  categoria,
  precioLista,
  precioFinal,
  descuento,
  variantes,
}: {
  nombre: string;
  categoria: string | null;
  precioLista: number;
  precioFinal: number;
  descuento: number;
  variantes: Variante[];
}) {
  const conTalla = variantes.filter((v) => v.label);
  const [talla, setTalla] = useState(
    () => conTalla.find((v) => v.stock > 0)?.label ?? conTalla[0]?.label ?? null,
  );
  const [cantidad, setCantidad] = useState(1);

  const elegida = conTalla.length ? conTalla.find((v) => v.label === talla) : variantes[0];
  const disponible = elegida?.stock ?? 0;

  const mensaje = [
    "Hola Ágata, me interesa este par:",
    "",
    `*${nombre}*`,
    categoria && `Categoría: ${categoria}`,
    talla && `Talla: ${talla}`,
    `Cantidad: ${cantidad}`,
    descuento > 0
      ? `Precio: ${price(precioFinal)} c/u (antes ${price(precioLista)}, −${descuento}%)`
      : `Precio: ${price(precioFinal)} c/u`,
    cantidad > 1 && `Total: ${price(precioFinal * cantidad)}`,
    "",
    "¿Me confirmas disponibilidad y cómo hago el pedido?",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mt-8 border-t border-line pt-8">
      {conTalla.length > 0 && (
        <>
          <p className="label !text-brand">Talla</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {conTalla.map((v) => (
              <li key={v.label}>
                <button
                  type="button"
                  disabled={v.stock === 0}
                  onClick={() => {
                    setTalla(v.label);
                    setCantidad(1);
                  }}
                  className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                    v.label === talla
                      ? "border-brand bg-brand text-white"
                      : v.stock === 0
                        ? "cursor-not-allowed border-line text-faint line-through decoration-1"
                        : "border-line hover:border-brand hover:text-brand"
                  }`}
                >
                  {v.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 flex items-end gap-4">
        <label className="w-24">
          <span className="label">Cantidad</span>
          <input
            className="field mt-1.5"
            type="number"
            min={1}
            max={Math.max(1, disponible)}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <p className="pb-2.5 text-xs text-muted">
          {disponible > 0 ? `${disponible} disponibles` : "Agotado"}
        </p>
      </div>

      <a
        href={whatsappUrl(mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        className="pill mt-6 w-full bg-brand text-white hover:bg-brand-soft"
      >
        <IconoWhatsApp className="size-4" />
        Pedir por WhatsApp
      </a>

      <p className="mt-3 text-center text-xs text-faint">
        Abre WhatsApp con los datos del producto ya escritos.
      </p>
    </div>
  );
}
