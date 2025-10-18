// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
  // si usas SSO de Clerk:
  "/sso-callback(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect(); // exige sesión en el resto
  }
});

export const config = {
  matcher: [
    // omite estáticos/_next y procesa el resto
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // siempre corre en API
    "/(api|trpc)(.*)",
  ],
};

// Piensa en `middleware.ts` como **el portero de tu app**.
// * **Cuándo corre:** antes de cada petición que coincida con su `matcher`.
// * **Qué hace en tu proyecto:** integra **Clerk** en el borde (Edge), **lee la sesión** y, si marcas rutas como protegidas, **bloquea o redirige** a `/sign-in` a quien no esté logueado.
// * **Qué no hace:** no toca tu base de datos ni usa APIs de Node (en Edge no se puede).
// * **Para qué sirve además:** puedes usarlo para redirecciones rápidas, rewrites o añadir/leer headers.
// * **Dónde está:** en la raíz (`middleware.ts`). Next lo detecta solo.
// Resumiendo: es un **filtro previo** que decide “¿dejo pasar esta petición o la mando a iniciar sesión?”, de forma muy rápida y sin cargar toda la página.


// En Next.js (App Router), middleware.ts es un archivo especial que se ejecuta antes de entregar cada ruta que coincida con su matcher. Piensa en él como un “portero” que puede dejar pasar, redirigir o bloquear peticiones.
// ¿Para qué sirve?
// Autenticación/autorización (lo más común con Clerk): proteger rutas, forzar login, leer sesión.
// Redirecciones y rewrites: mandar a otra URL según reglas.
// Localización / A/B testing / headers: añadir o inspeccionar cabeceras.
// Logging/medición simple.
// Importante: el middleware corre en Edge Runtime → no puedes usar APIs de Node (Mongoose, fs, etc.).