import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  async function signIn(formData: FormData) {
    "use server";
    const db = await supabase();

    const { error } = await db.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    // La pantalla dice solo "credenciales incorrectas": distinguir "no existe"
    // de "clave mala" le sirve más a quien tantea. La causa real va al log del
    // servidor, que sí puedes leer tú.
    if (error) console.error("[login]", error.code, error.message);

    redirect(error ? "/login?error=1" : "/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center font-serif text-4xl">
          Ágata
        </Link>
        <p className="label mt-2 text-center">Panel administrativo</p>

        <form action={signIn} className="mt-10 space-y-3">
          <input
            className="field"
            name="email"
            type="email"
            placeholder="Correo"
            autoComplete="username"
            required
          />
          <input
            className="field"
            name="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            required
          />
          {error && <p className="text-xs text-ink">Credenciales incorrectas.</p>}
          <button className="w-full bg-brand py-2.5 text-xs tracking-[0.14em] text-white uppercase transition-colors hover:bg-brand-soft">
            Entrar
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-faint">
          Acceso restringido.
        </p>
      </div>
    </main>
  );
}
