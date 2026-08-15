# Marca blanca — catálogo

Catálogo de productos sin proceso de pago. Next 16 (App Router) + Supabase.
Todo server-rendered: cero JavaScript de cliente propio, cero librerías de formularios,
cero manejo de estado.

## Puesta en marcha

1. Crea un proyecto en [supabase.com](https://supabase.com) (gratis, sin tarjeta).
2. **SQL Editor → New query** → pega `supabase/schema.sql` completo → **Run**.
   Crea tablas, RLS, el bucket `products` y tres categorías de ejemplo.
3. **Authentication → Sign In / Providers**, dos interruptores distintos:
   - *User Signups → Allow new users to sign up*: **OFF**. Nadie se registra solo.
   - *Auth Providers → Email*: **ON**. Es el mecanismo de login; apagarlo deja
     fuera también a los usuarios que ya existen (`email_provider_disabled`).
4. **Authentication → Users → Add user**: tu correo y contraseña. Marca *Auto Confirm*.
5. Copia las llaves de **Project Settings → API**:

   ```bash
   cp .env.local.example .env.local   # y pega URL + anon key
   npm run dev
   ```

6. `http://localhost:3000` es la tienda. `/login` entra al panel.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Catálogo, filtrable por `?categoria=slug` |
| `/producto/[slug]` | Ficha con precio, descuento, tallas y stock |
| `/login` | Único punto de entrada al panel |
| `/admin` | Lista de productos |
| `/admin/productos/nuevo` | Crear |
| `/admin/productos/[id]` | Editar datos, stock por talla e imágenes |
| `/admin/categorias` | Crear y eliminar categorías |

## Dos decisiones que conviene no deshacer

**El stock vive solo en `variants`.** Un reloj es un producto con una variante de
`label = null`; una camisa tiene una por talla. Poner también un `stock` en
`products` obliga a sincronizar dos números para siempre.

**El descuento se guarda como porcentaje, no como precio rebajado.**
`discount_percent = 0` significa sin descuento; el precio final lo calcula
`finalPrice()` al mostrar. Guardar las dos cifras obliga a recalcular una cada
vez que cambia la otra, y tarde o temprano se desincronizan.

## Seguridad

La frontera real es RLS, no el frontend. Las policies exigen `auth.uid() is not null`
para toda escritura, así que la `anon key` expuesta en el navegador no puede
modificar nada. El `proxy.ts` solo redirige a `/login` y refresca el token —
si lo borras, el panel sigue sin poder escribir.

## Despliegue

Netlify o Cloudflare Workers. Evita Vercel Hobby: su plan gratis prohíbe uso
comercial. Copia las dos variables de entorno en el panel del host y listo.

## Techos conocidos

- **Egress de Supabase Free: 5 GB/mes.** Es el primer límite que vas a tocar,
  no la base de datos. Sube WebP de ~1200px. Si se queda corto, mueve el bucket
  a Cloudflare R2 (10 GB gratis, egress $0) sin tocar el resto del código.
- **El proyecto de Supabase se pausa tras 7 días sin actividad** en el plan gratis.
- **Orden de imágenes por campo numérico**, no drag & drop.
- **`one()` en `src/lib/supabase.ts`** existe porque no hay tipos generados de la
  base. Con un proyecto en pie, `npx supabase gen types typescript` lo vuelve
  innecesario.
