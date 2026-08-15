import assert from "node:assert/strict";
import test from "node:test";
import { rangoGlobal, rangoTallas } from "./tallas.ts";

const v = (labels: (string | null)[]) => labels.map((label, position) => ({ label, position }));

test("el rango de la ficha respeta las etiquetas reales", () => {
  assert.equal(rangoTallas(v([null])), "Talla única", "producto sin tallas: una variante con null");
  assert.equal(rangoTallas(v(["38"])), "Talla 38");
  assert.equal(rangoTallas(v(["36", "40", "38"])), "Tallas 36–40", "ordena por número, no por texto");
  assert.equal(rangoTallas(v(["S", "M", "L"])), "Tallas S · M · L", "etiquetas no numéricas");
});

test("el rango de la portada ignora las variantes sin etiqueta", () => {
  assert.equal(rangoGlobal(v([null, null])), "Única", "el null no puede convertirse en 0");
  assert.equal(rangoGlobal(v(["35", null, "42", "Única"])), "35–42", "catálogo mixto");
  assert.equal(rangoGlobal(v(["38", "38"])), "38", "un solo número no es un rango");
  assert.equal(rangoGlobal([]), "Única", "catálogo vacío");
});
