import assert from "node:assert/strict";
import test from "node:test";
import { finalPrice, normalizePercent, slugify } from "./format.ts";

test("el porcentaje queda entero entre 0 y 100", () => {
  assert.equal(normalizePercent(20), 20);
  assert.equal(normalizePercent(null), 0, "campo vacío");
  assert.equal(normalizePercent(NaN), 0, "texto en el input");
  assert.equal(normalizePercent(-5), 0, "negativo no rebaja");
  assert.equal(normalizePercent(150), 100, "el CHECK de la tabla lo rechazaría");
  assert.equal(normalizePercent(12.6), 13, "la columna es int");
});

test("el precio final se calcula desde el porcentaje", () => {
  assert.equal(finalPrice(100000, 0), 100000, "sin descuento no cambia nada");
  assert.equal(finalPrice(100000, 20), 80000);
  assert.equal(finalPrice(100000, 100), 0);
  assert.equal(finalPrice("89900", 15), 76415, "numeric de postgres llega como string");
  assert.equal(finalPrice(33333, 33), 22333, "redondea: COP no tiene decimales");
});

test("slugify limpia tildes, mayúsculas y símbolos", () => {
  assert.equal(slugify("Camisa Añil"), "camisa-anil");
  assert.equal(slugify("  Reloj / Acero  "), "reloj-acero");
});
