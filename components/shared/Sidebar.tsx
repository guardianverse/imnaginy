"use client"

import { navLinks } from '@/constants'    // navLinks (ojo, con L: navLinks) es un array de enlaces de navegación que importas desde @/constants
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'

const Sidebar = () => {
  const pathname = usePathname();

  return (             // Ese es el return de tu componente React (Sidebar). Devuelve el árbol completo que debe renderizarse.
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <Link href="/" className="sidebar-logo">
          <Image src="/assets/images/logo-text.svg" alt="logo" width={180} height={28} />
        </Link>

        <nav className="sidebar-nav">
          <SignedIn>
            <ul className="sidebar-nav_elements">
              {navLinks.slice(0, 6).map((link) => {
                const isActive = link.route === pathname
// Aquí estás dentro de otra función: la función callback que le pasas a Array.map.

// map recibe cada link y debe devolver el JSX de ese item (<li>…</li>).

// El resultado es un array de elementos que React sabe renderizar.

// Las llaves { ... } alrededor del map son porque en JSX metes expresiones de JavaScript entre llaves.
                return (
                  <li key={link.route} className={`sidebar-nav_element group ${
                    isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'
                  }`}>
                    <Link className="sidebar-link" href={link.route}>
                      <Image 
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && 'brightness-200'}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              </ul>


            <ul className="sidebar-nav_elements">
              {navLinks.slice(6).map((link) => {
                const isActive = link.route === pathname

                return (
                  <li key={link.route} className={`sidebar-nav_element group ${
                    isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'
                  }`}>
                    <Link className="sidebar-link" href={link.route}>
                      <Image 
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && 'brightness-200'}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                )
              })}

              <li className="flex-center cursor-pointer gap-2 p-4">
                <UserButton afterSignOutUrl='/' showName />
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <Button asChild className="button bg-purple-gradient bg-cover">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar


/* <nav className="sidebar-nav">
Contenedor semántico de navegación (sidebar). La clase sidebar-nav es tuya para estilizarlo.

<SignedIn>
De Clerk: solo renderiza su contenido si el usuario está autenticado.
Si no hay sesión, esto no se muestra (y normalmente en tu código fuera de este bloque hay un <SignedOut> con un botón “Login”).

<ul className="sidebar-nav_elements">
Lista de elementos del menú. La clase es tuya (espaciados, columnas, etc.).

navLinks.slice(0, 6).map((link) => { ... })
Toma los primeros 6 enlaces de navLinks y pinta un <li> por cada uno. (Suele haber otro slice(6) para la segunda sección del menú.)

const isActive = link.route === pathname
Calcula si el enlace está activo comparando la ruta del enlace con la ruta actual (pathname, que viene de usePathname() en el componente).
Si estás exactamente en esa ruta, isActive es true.

<li key={link.route} className={...}>
Cada ítem:

key={link.route}: clave única para React.

Clases condicionales:

activo → bg-purple-gradient text-white

inactivo → text-gray-700

group sirve para efectos “group-hover” si los usas en hijos.

<Link className="sidebar-link" href={link.route}>
Enlace de Next (navegación en cliente + prefetch). sidebar-link es tu clase.

<Image ... className={${isActive && 'brightness-200'}} />
Icono (24×24). Si el item está activo, añade brightness-200 (más brillante).
Nota fina: ese patrón con template literal puede acabar metiendo la clase "false" cuando no está activo. Mejor:

className={isActive ? 'brightness-200' : ''}


o usar una utilidad tipo cn()/clsx.

{link.label}
El texto del enlace. */



// ¿Para qué sirve en tu componente?

// Lo recorres con .map() para pintar cada <li> del menú.

// Usas link.route para el href, link.label para el texto y link.icon para la imagen.

// Con usePathname() comparas pathname con link.route para resaltar el activo.

// En tu código haces slice(0, 6) y luego slice(6) para separar enlaces “principales” y “secundarios”.


// usePathname() te da la ruta actual (por ej. "/projects/42").

// En tu lista de enlaces (navLinks), cada item tiene un route (por ej. "/projects").

// Comparas la ruta actual con el route del enlace para saber si ese enlace está activo y así ponerle una clase especial.


// Para la home ("/") pedimos igualdad exacta.

// Para el resto, marcamos activo si:

// estás exactamente en esa ruta (pathname === link.route), o

// estás en una subruta suya (pathname.startsWith(link.route + "/")),
// p. ej. "/projects/42" debe activar "/projects".

// Así evitas falsos positivos como "/settings-advanced" activando "/settings" (porque exigimos el / después).

// Qué hace visualmente

// Si isActive es true, le pones una clase (p. ej. bg-purple text-white) para resaltar el enlace.

// Al navegar, pathname cambia, React re-renderiza y el “activo” se mueve al enlace correcto.


// Parte el menú

// navLinks.slice(6)


// Toma los enlaces desde el índice 6 hasta el final (los “secundarios”). Los primeros 6 ya se pintaron en la lista anterior.

// Recorre y pinta cada item

// .map(link => { ... return (<li>...</li>) })


// Por cada enlace crea un <li> con su <Link> e icono (<Image>) + texto (link.label).

// Marca el activo

// const isActive = link.route === pathname


// Si la ruta actual (pathname) coincide con la del enlace (link.route), isActive es true.

// Aplica estilos según activo/inactivo

// className={`sidebar-nav_element group ${
//   isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'
// }`}


// Activo → fondo morado degradado y texto blanco.

// Inactivo → texto gris.

// El icono también cambia si está activo:

// className={`${isActive && 'brightness-200'}`}


// (Mejor usa ternario: className={isActive ? 'brightness-200' : ''} para evitar insertar "false".)

// Clave única

// key={link.route}


// React usa la key para identificar cada <li>.

// Navegación

// <Link href={link.route}>...</Link>


// Usa el router de Next (rápido, sin recarga completa).

// Icono optimizado

// <Image src={link.icon} width={24} height={24} alt="logo" />






// <SignedOut>
//   <Button asChild className="button bg-purple-gradient bg-cover">
//     <Link href="/sign-in">Login</Link>
//   </Button>
// </SignedOut>
// <SignedOut>: renderiza su contenido solo si NO hay sesión.

// <Button asChild> (shadcn/ui):

// Button aporta el estilo de botón.

// asChild hace que el estilo se aplique al hijo sin cambiar el elemento (el hijo sigue siendo un <a>).

// <Link href="/sign-in">: enlace de Next a tu pantalla de login (navegación rápida, sin recarga).

// Clases: bg-purple-gradient bg-cover dan el look del botón.





// Sin asChild, <Button> renderiza un <button>:

// <Button>Hola</Button>
// // → <button class="...clases del botón...">Hola</button>


// Con asChild, <Button> no crea un <button>; en su lugar usa un Slot que:

// clona al único hijo,

// le inyecta las props y clases del botón,

// y renderiza ese elemento final.

// <Button asChild>
//   <Link href="/sign-in">Login</Link>
// </Button>

// // → <a href="/sign-in" class="...clases del botón...">Login</a>


// Así consigues que un <Link> (o <a>, <div>, etc.) se vea y se comporte como un botón, pero manteniendo la semántica correcta (sigue siendo un enlace, no un botón). Además evitas HTML inválido como <button><a>...</a></button>.


// > es la etiqueta de enlace (anchor) en HTML.

// Para qué sirve: crea un hipervínculo. Al hacer clic, navegas a otra URL, a una parte de la misma página, o lanzas acciones como abrir el correo/teléfono.

// Estructura básica:

// <a href="/sign-in" class="clases-del-boton">Login</a>


// href: a dónde apunta (ruta interna /sign-in, externa https://…, ancla #seccion, mailto:, tel:).

// Contenido: el texto/elemento clicable (aquí “Login”).

// class: estilos CSS (puedes hacer que se vea como botón).






