// ponytail: moneda fija en COP. Si vendes en otra, cambia estas dos líneas.
const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const price = (value: number | string) => money.format(Number(value));

// Entero entre 0 y 100. Vacío, texto o fuera de rango cae en 0 = sin
// descuento; el CHECK de la tabla rechazaría la fila y el 400 llegaría a
// pantalla. 100% se permite: es un regalo, no un error.
export const normalizePercent = (value: number | null) =>
  value === null || !Number.isFinite(value) ? 0 : Math.min(100, Math.max(0, Math.round(value)));

// El precio rebajado no se guarda, se calcula. COP no usa decimales.
export const finalPrice = (price: number | string, percent: number) =>
  Math.round(Number(price) * (1 - percent / 100));

export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
