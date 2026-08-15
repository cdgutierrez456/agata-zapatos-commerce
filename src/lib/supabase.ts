import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function supabase() {
  const store = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Los server components no pueden escribir cookies; el middleware
        // refresca la sesión, así que aquí el fallo es esperado.
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {}
      },
    },
  });
}

// Sin los tipos generados de la base, supabase-js asume que toda relación es
// un arreglo. `categories` es to-one: una fila. Corre `supabase gen types` y
// esto sobra, pero no vale la pena depender del CLI para tres llamadas.
export const one = <T>(rel: T | T[] | null): T | null =>
  Array.isArray(rel) ? (rel[0] ?? null) : rel;

export const imageUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
