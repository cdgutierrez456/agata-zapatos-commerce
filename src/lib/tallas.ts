// Un producto sin tallas guarda una sola variante con label null, así que
// `Number(label)` daría 0 y el rango saldría "0–0". Todo pasa por aquí para
// que ese null se descarte una sola vez.
type Variante = { label: string | null; position: number };

const numericas = (labels: string[]) => {
  const nums = labels.map(Number).filter(Number.isFinite);
  return nums.length === labels.length && nums.length > 0 ? nums : null;
};

const etiquetas = (variants: Variante[]) =>
  [...variants]
    .sort((a, b) => a.position - b.position)
    .map((v) => v.label)
    .filter((l): l is string => !!l);

// Lo que va en la ficha del catálogo: "Tallas 35–41", "Talla 38" o el texto
// tal cual cuando las etiquetas no son números ("Única", "S · M · L").
export function rangoTallas(variants: Variante[]) {
  const labels = etiquetas(variants);
  if (!labels.length) return "Talla única";
  if (labels.length === 1) return `Talla ${labels[0]}`;

  const nums = numericas(labels);
  return nums ? `Tallas ${Math.min(...nums)}–${Math.max(...nums)}` : `Tallas ${labels.join(" · ")}`;
}

// La cifra de la portada: el rango que cubre todo el catálogo junto. Aquí sí
// se ignoran las etiquetas no numéricas —un producto de talla única no puede
// dejar sin número al resto del catálogo.
export function rangoGlobal(variants: Variante[]) {
  const nums = etiquetas(variants).map(Number).filter(Number.isFinite);
  if (!nums.length) return "Única";

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? String(min) : `${min}–${max}`;
}
