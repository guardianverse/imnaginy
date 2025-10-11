

// En Next.js (App Router), app/layout.tsx es el “marco raíz” de tu web. Es obligatorio y sirve para poner todo lo que debe estar una sola vez y para todas las páginas.

// Para qué sirve (en sencillo)

// Esqueleto del documento: define <html> y <body> (idioma, clases, etc.).

// Pegamento global: envuelve todas las páginas con proveedores (auth, tema, etc.). En tu caso: ClerkProvider.

// Estilos globales: aquí se importa ./globals.css (Tailwind y resets). Los CSS globales van aquí.

// Tipografía global: cargas la fuente con next/font y la aplicas al <body> (sin parpadeos/saltos).

// Metadatos por defecto: export const metadata pone el <title> y <meta> base para todas las rutas.

// Persistencia entre rutas: Navbar, footer, providers y estado del layout no se recrean en cada navegación (mejor UX y rendimiento).

// Lugar para cosas “de toda la app”: toasts, analytics, <ThemeProvider>, etc.

// Cómo encaja tu archivo concreto

// ClerkProvider: da autenticación a toda la app y fija el color primario de la UI de Clerk.

// Fuente IBM Plex con next/font: autohospedada y optimizada; IBMPlex.variable + font-IBMPlex la aplican al body.

// cn: une clases de forma segura (Tailwind + clase de la fuente).

// metadata: título y descripción base (“Imaginify…”).

// {children}: aquí Next inserta la página actual (lo que esté en app/xxx/page.tsx).

// Qué pasaría sin él

// No podrías importar CSS global ni fijar el <html>/<body> correctamente.

// No tendrías un sitio único para auth/tema/nav globales.

// Perderías consistencia y rendimiento (repetirías setup en cada página).



import type { Metadata } from "next"; 
// Solo importa el tipo Metadata (TypeScript) para tipar el objeto metadata que Next.js u
// sa en el App Router (define <title>, <meta name="description">, etc.).

import { IBM_Plex_Sans } from "next/font/google";
// Usa next/font para autohospedar la fuente de Google 
// (sin FOUT/CLS y con CSS generado automáticamente).

import { cn } from "@/lib/utils";
// Utilidad típica para combinar clases de forma segura (suele envolver clsx + tailwind-merge). 
// Aquí une la clase de Tailwind con la clase generada por la fuente.

import { ClerkProvider } from "@clerk/nextjs";
// Proveedor de Clerk (auth). Envuelve tu app para que los componentes de Clerk
//  (SignIn, UserButton, etc.) funcionen y para temear su UI

import "./globals.css";
// Carga CSS global (normalmente incluye 
// @tailwind base; @tailwind components; @tailwind utilities; y estilos globales).




// Configuración de la fuente
const IBMPlex = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex'
});
// IBM_Plex_Sans(...) devuelve un objeto con propiedades como className y variable.

// subsets: ["latin"] ⇒ solo descarga el subset latino (menos peso).

// weight: [...] ⇒ limita a esos grosores (400–700) para optimizar.

// variable: '--font-ibm-plex' ⇒ crea una clase que define la CSS custom property --font-ibm-plex con la font-family cargada.




// Metadatos de la app
export const metadata: Metadata = {
  title: "Imaginify",
  description: "AI-powered image generator",
};
// Next.js (App Router) leerá esto para generar <title> y 
// <meta> por defecto para todas las rutas bajo este layout.

// Tipado con Metadata para autocompletado y validación.




// El Root Layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: { colorPrimary: '#624cf5' }
    }}>
      <html lang="en">
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
// Firma del componente

// children: React.ReactNode ⇒ todo lo que rendericen tus páginas.

// Readonly<...> ⇒ evita mutaciones accidentales de props.

// <ClerkProvider ...>

// Inyecta el contexto de autenticación en toda la app.

// appearance.variables.colorPrimary cambia el color principal de la UI de Clerk a #624cf5.

// <html lang="en">

// Idioma del documento para SEO/accesibilidad. (Si tu app es en español, podrías poner lang="es").

// <body className={...}>

// cn("font-IBMPlex antialiased", IBMPlex.variable) une:

// "font-IBMPlex": familia de fuente definida en Tailwind (que apunta a var(--font-ibm-plex)).

// "antialiased": suavizado de fuentes (Tailwind).

// IBMPlex.variable: clase generada por next/font que define la variable --font-ibm-plex con la familia correcta.

// Resultado: el body usa IBM Plex Sans con pesos 400–700, suave, sin parpadeos ni reflujo.

// {children}

// Aquí se renderiza todo lo que esté bajo app/ (páginas, layouts anidados, etc.).



// Flujo mental del render

// Next.js carga este RootLayout (archivo app/layout.tsx) en todas las páginas.

// ClerkProvider envuelve la app ⇒ autenticación disponible globalmente.

// next/font inyecta estilos + clases ⇒ se define --font-ibm-plex.

// Tailwind (font-IBMPlex) usa esa variable ⇒ tipografía consistente.

// metadata fija <title> y <meta> por defecto.




// 1) import type { Metadata } from "next"

// ¿Para qué sirve? Tipar el objeto metadata para que Next.js genere <title>, <meta> y Open Graph correctamente.

// ¿Por qué así? import type se elimina en compilación ⇒ 0 bytes en el bundle y mejor DX (autocompletado).

// Si lo quitas: Pierdes ayuda de tipos (podrías poner claves mal y no enterarte).

// Alternativas: Ninguna real; puedes no tipar, pero es menos seguro.

// 2) import { IBM_Plex_Sans } from "next/font/google"

// ¿Para qué sirve? Cargar la fuente autohospedada y optimizada (preload, CSS crítico) sin FOUT/CLS.

// ¿Por qué así? next/font integra con SSR/RSC, cumple CSP y reduce saltos de layout.

// Si lo quitas: Tendrías que usar <link> a Google Fonts (más FOUT, dependencia externa, peor LCP).

// Alternativas:

// <link rel="preconnect"> + <link href="https://fonts.googleapis.com/..."> (más simple, peor rendimiento/privacidad).

// Servir la fuente tú mismo (más trabajo manual).

// Mini comparativa (línea de tiempo)

// Con runtime JS para fuentes
// HTML → descarga JS → ejecuta JS → carga fuente → repinta texto (riesgo de FOUT/CLS).

// Con next/font
// HTML ya trae @font-face + preload → carga fuente en paralelo → pinta texto correcto desde el principio.

// Beneficio: mejor FCP/LCP, menos CLS, y la tipografía funciona incluso si el JS del cliente tarda o está bloqueado.

// Mini comparativa (línea de tiempo)

// Con runtime JS para fuentes
// HTML → descarga JS → ejecuta JS → carga fuente → repinta texto (riesgo de FOUT/CLS).

// Con next/font
// HTML ya trae @font-face + preload → carga fuente en paralelo → pinta texto correcto desde el principio.

// Beneficio: mejor FCP/LCP, menos CLS, y la tipografía funciona incluso si el JS del cliente tarda o está bloqueado.




// 3) Config de fuente:
// const IBMPlex = IBM_Plex_Sans({ 
//   subsets: ["latin"],
//   weight: ['400','500','600','700'],
//   variable: '--font-ibm-plex'
// });


// ¿Para qué sirve? Define qué se descarga (subset + pesos) y expone una CSS variable (--font-ibm-plex).

// ¿Por qué así?

// subsets y weight ⇒ descargas solo lo necesario (menos KB).

// variable ⇒ puedes integrar con Tailwind como font-IBMPlex y cambiar la fuente por tema/modo oscuro fácilmente.

// Si lo quitas/lo haces distinto:

// Sin weight: se baja el default (más peso o pesos que no usas).

// Sin variable: puedes usar IBMPlex.className directamente, pero pierdes la integración elegante con Tailwind.


// vale, versión “para peques” 👶👇

// **Imagina tu web como un cuaderno que le enseñas a la gente.**

// * **La fuente (next/font)**
//   Es la *letra* con la que escribes.
//   Si guardas tus propios rotuladores en tu mochila (autohospedada), pintas rápido y bonito, sin que el texto cambie de forma ni “salte” en la página.

// * **Tailwind**
//   Es una **caja de pegatinas** con estilos ya listos: “texto grande”, “margen pequeño”, “color morado”, “redondeado”, etc.
//   Pegas las que quieras y tu cuaderno queda **ordenado y bonito** sin dibujar todo desde cero.

// * **clsx/cn**
//   Es el **pegamento inteligente** para juntar varias pegatinas sin liarla.
//   Si pones “margen-pequeño” y “margen-grande” a la vez, clsx elige bien para que no quede raro.

// * **ClerkProvider (login)**
//   Es el **portero** del edificio. Revisa quién entra (iniciar sesión), les pone su etiqueta y deja todo seguro.

// * **metadata (título y descripción)**
//   Es la **portada** del cuaderno. Sirve para que Google y otros sepan de qué va y lo encuentren mejor.

// * **globals.css**
//   Son las **reglas de la clase**: todos siguen las mismas normas básicas (tamaños, colores por defecto) para que nada se vea raro.

// * **“No esperar al JS del cliente”**
//   Es como **servir la comida ya hecha**. El servidor cocina antes y el alumno come al llegar: la página sale rápida y sin parpadeos.

// ---

// ### ¿Qué gana tu página con todo esto?

// * **Más rápida** (aparece “bonita” desde el principio).
// * **Sin saltos** ni cambios feos de letra.
// * **Más ordenada y consistente** (Tailwind).
// * **Más fácil de mantener** (pegatinas en vez de pintar a mano).
// * **Segura y lista para usuarios con cuenta** (Clerk).
// * **Mejor para SEO** (portada bien hecha con metadata).

// 👉 Si es un proyecto pequeño para jugar, puedes vivir sin algunas cosas.
// 👉 Si es una app “de verdad”, esto te ahorra tiempo, evita sustos y hace que se vea y funcione mejor.




