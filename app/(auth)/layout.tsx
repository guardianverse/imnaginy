
// Qué hace, en palabras simples

// Layout: es un envoltorio (marco) que solo se aplica a las rutas dentro de (auth).

// children: es la página concreta que estés viendo (por ejemplo, sign-in/page.tsx o sign-up/page.tsx).
// Piensa: “mete la página aquí dentro”.

// <main className="auth"> ... </main>: crea un contenedor principal con la clase auth para darle estilos comunes a todas las pantallas de login/registro (centrado, fondo, tamaños…).

// ¿Para qué te sirve?

// Para no repetir estilos en cada pantalla de auth.

// Para tener un diseño coherente (todas las páginas de auth comparten el mismo marco).

// Para separar el layout de auth del resto del sitio (navbar, sidebar, etc. no aparecen aquí si no quieres).

// Cómo queda en la práctica

// Si visitas /sign-in, Next renderiza:

// RootLayout (global) → Auth Layout (este archivo) → SignInPage


// Es decir, tu página sign-in se dibuja dentro de <main class="auth">…</main>.

/* <body>
  <header>Logo + menú</header>
  <nav>Links</nav>

  <main>
    <!-- Contenido único de esta página: formulario de login, artículo, dashboard... -->
  </main>

  <footer>Pie de página</footer>
</body>
En tu layout de (auth), el <main class="auth"> es ese contenedor del contenido principal de las pantallas de login/registro, dentro del único <body> que define el layout raíz. */



import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="auth">{children}</main>
  )
}

export default Layout



//  si pones rafce se crea solo el code de este archivo


// ¡Buena! Esa carpeta (auth) es un “grupo de rutas” de Next.js.

// ¿Qué es un grupo de rutas?

// Una carpeta con paréntesis (p. ej. (auth)) no aparece en la URL. Sirve solo para organizar y para aplicar un layout diferente a todas las páginas dentro de ese grupo.

// ¿Para qué se usa en auth?

// Ordenar todo lo de autenticación en un sitio: sign-in, sign-up, forgot-password, etc.

// Tener un layout distinto (sin navbar/footers, con un fondo especial) solo para esas pantallas.

// Mantener la URL limpia:

// Con paréntesis: app/(auth)/sign-in/page.tsx → URL: /sign-in

// Sin paréntesis: app/auth/sign-in/page.tsx → URL: /auth/sign-in