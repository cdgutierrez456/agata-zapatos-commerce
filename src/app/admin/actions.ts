"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { normalizePercent, slugify } from "@/lib/format";

// Nadie valida "¿es admin?" aquí a propósito: el proxy bloquea /admin sin
// sesión y las policies RLS rechazan toda escritura anónima. La frontera de
// seguridad está en la base de datos, no en una función que se puede olvidar.

const text = (form: FormData, key: string) => {
  const value = String(form.get(key) ?? "").trim();
  return value || null;
};

const number = (form: FormData, key: string) => {
  const value = text(form, key);
  return value === null ? null : Number(value);
};

function refresh() {
  revalidatePath("/", "layout");
}

// Toda acción de la ficha vuelve a ella diciendo qué pasó. `ok` es una clave
// corta; `error` es el mensaje literal de Supabase, que en un panel de un solo
// admin es más útil en pantalla que enterrado en la terminal.
const volverAlProducto = (id: string, resultado: { message: string } | null, ok: string) =>
  redirect(
    `/admin/productos/${id}?${
      resultado ? `error=${encodeURIComponent(resultado.message)}` : `ok=${ok}`
    }`,
  );

// ------------------------------------------------------------ categorías

export async function createCategory(form: FormData) {
  const name = text(form, "name");
  if (!name) return;
  const db = await supabase();
  const { error } = await db
    .from("categories")
    .insert({ name, slug: slugify(name), position: number(form, "position") ?? 0 });

  refresh();
  // El slug es unique: dos categorías con el mismo nombre chocan y hay que
  // decirlo, o el formulario se limpia como si hubiera funcionado.
  redirect(
    error
      ? `/admin/categorias?error=${encodeURIComponent("Ya existe una categoría con ese nombre.")}`
      : "/admin/categorias?ok=creada",
  );
}

export async function deleteCategory(form: FormData) {
  const id = String(form.get("id"));
  const db = await supabase();

  // La FK es `on delete set null`: borrar la categoría no falla, deja los
  // productos sin categoría y desaparecidos de la tienda. Se pregunta antes.
  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count) {
    const plural = count === 1 ? "" : "s";
    redirect(
      `/admin/categorias?error=${encodeURIComponent(
        `No se puede eliminar una categoría que tiene productos. Esta tiene ${count} producto${plural} asociado${plural}: muévelos a otra categoría o elimínalos primero.`,
      )}`,
    );
  }

  await db.from("categories").delete().eq("id", id);
  refresh();
  redirect("/admin/categorias?ok=eliminada");
}

// -------------------------------------------------------------- producto

function productFields(form: FormData) {
  return {
    name: text(form, "name") ?? "Sin nombre",
    category_id: text(form, "category_id"),
    description: text(form, "description"),
    price: number(form, "price") ?? 0,
    // El min/max del input es del navegador; esto lo vuelve cierto.
    discount_percent: normalizePercent(number(form, "discount_percent")),
    active: form.get("active") === "on",
  };
}

// Los `required` del formulario son del navegador: se saltan con curl o con JS
// desactivado. Se revisa aquí otra vez, y diciendo cuál campo falta.
function campoFaltante(form: FormData) {
  if (!text(form, "name")) return "Nombre";
  if (!text(form, "category_id")) return "Categoría";
  if (!text(form, "price")) return "Precio";
  return null;
}

const faltaMsg = (campo: string) =>
  encodeURIComponent(`Falta llenar el campo «${campo}»: sin eso el producto no se puede guardar.`);

export async function createProduct(form: FormData) {
  const falta = campoFaltante(form);
  if (falta) redirect(`/admin/productos/nuevo?error=${faltaMsg(falta)}`);

  const db = await supabase();
  const fields = productFields(form);

  const { data, error } = await db
    .from("products")
    .insert({ ...fields, slug: `${slugify(fields.name)}-${Date.now().toString(36)}` })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "No se pudo crear el producto");

  // Todo producto nace con una variante sin talla: el stock siempre vive en
  // variants, incluso para un reloj. Un solo camino de inventario.
  await db.from("variants").insert({ product_id: data.id, stock: 0 });

  refresh();
  // A la ficha, no a la lista: el stock y las imágenes son el siguiente paso
  // obligatorio de un producto nuevo y viven ahí. Mandarlo a /admin obligaba a
  // buscar el producto recién creado para poder terminarlo.
  redirect(`/admin/productos/${data.id}?ok=creado`);
}

export async function updateProduct(form: FormData) {
  const id = String(form.get("id"));
  const falta = campoFaltante(form);
  if (falta) redirect(`/admin/productos/${id}?error=${faltaMsg(falta)}`);

  const fields = productFields(form);
  const db = await supabase();
  const { error } = await db.from("products").update(fields).eq("id", id);
  refresh();
  // Guardar los datos cierra la edición y devuelve a la lista. Subir imágenes
  // y tocar stock no: ahí sigues trabajando sobre el mismo producto.
  if (error) volverAlProducto(id, error, "datos");
  redirect("/admin?ok=datos");
}

export async function deleteProduct(form: FormData) {
  const id = String(form.get("id"));
  const db = await supabase();

  // El cascade borra filas, no archivos: hay que vaciar la carpeta a mano.
  const { data: files } = await db.storage.from("products").list(id);
  if (files?.length) {
    await db.storage.from("products").remove(files.map((f) => `${id}/${f.name}`));
  }
  await db.from("products").delete().eq("id", id);

  refresh();
  redirect("/admin");
}

// -------------------------------------------------------------- variantes

export async function saveVariant(form: FormData) {
  const db = await supabase();
  const product_id = String(form.get("product_id"));
  const id = text(form, "id");
  const row = {
    label: text(form, "label"),
    stock: Math.max(0, number(form, "stock") ?? 0),
    position: number(form, "position") ?? 0,
  };

  // Los índices únicos rechazan tallas repetidas y una segunda variante sin
  // talla. Eso fallaba en silencio: el formulario volvía como si nada.
  const { error } = id
    ? await db.from("variants").update(row).eq("id", id)
    : await db.from("variants").insert({ ...row, product_id });

  refresh();
  volverAlProducto(product_id, error, "stock");
}

export async function deleteVariant(form: FormData) {
  const db = await supabase();
  await db.from("variants").delete().eq("id", String(form.get("id")));
  refresh();
}

// --------------------------------------------------------------- imágenes

export async function uploadImage(form: FormData) {
  const file = form.get("file") as File | null;
  const product_id = String(form.get("product_id"));
  if (!file?.size)
    redirect(`/admin/productos/${product_id}?error=${encodeURIComponent("No elegiste archivo.")}`);

  const db = await supabase();
  const path = `${product_id}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;

  const subida = await db.storage.from("products").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (subida.error) {
    console.error("[imagen:storage]", subida.error.message);
    volverAlProducto(product_id, subida.error, "imagen");
  }

  const { count } = await db
    .from("images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", product_id);

  // Subir el archivo y registrar la fila son dos operaciones y la segunda
  // puede fallar sola. Sin este control el archivo queda en Storage sin fila
  // que lo apunte: existe, pesa, y no lo ve nadie.
  const { error } = await db.from("images").insert({ product_id, path, position: count ?? 0 });
  if (error) {
    console.error("[imagen:fila]", error.code, error.message);
    await db.storage.from("products").remove([path]);
  }

  refresh();
  volverAlProducto(product_id, error, "imagen");
}

export async function deleteImage(form: FormData) {
  const db = await supabase();
  const path = String(form.get("path"));
  await db.storage.from("products").remove([path]);
  await db.from("images").delete().eq("id", String(form.get("id")));
  refresh();
}

// ------------------------------------------------------------------ sesión

export async function signOut() {
  const db = await supabase();
  await db.auth.signOut();
  redirect("/login");
}
