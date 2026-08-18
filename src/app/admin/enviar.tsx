"use client";

import { useFormStatus } from "react-dom";

// Un botón que sabe si su propio formulario está enviando. `useFormStatus` ya
// lo da hecho: sin estado propio, sin onSubmit. Deshabilitarlo mientras tanto
// es lo que impide crear el mismo producto tres veces por tres clics.
export function Enviar({
  children,
  cargando,
  className = "",
  ...props
}: React.ComponentProps<"button"> & { cargando: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {pending && (
        <span
          aria-hidden
          className="mr-2 inline-block size-3 animate-spin rounded-full border border-current border-t-transparent align-[-2px]"
        />
      )}
      {pending ? cargando : children}
    </button>
  );
}
