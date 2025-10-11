import MobileNav from '@/components/shared/MobileNav'
import Sidebar from '@/components/shared/Sidebar'
import { Toaster } from '@/components/ui/toaster'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="root">
      <Sidebar />
      <MobileNav /> 

      <div className="root-container">
        <div className="wrapper">
          {children}
        </div>
      </div>
      
      {/* <Toaster /> */}
    </main>
  )
}

export default Layout




// Orden: metes la “web pública” (home, landing, about, contacto…) en (root), y la parte privada en (app) o (dashboard), y el login en (auth).

// Layouts distintos: marketing con un layout, dashboard con otro, auth con otro.

// Ejemplo típico
// app/
//   layout.tsx               ← root layout global (obligatorio)
//   (root)/                  ← tu sitio público
//     layout.tsx             ← layout solo para la parte pública
//     page.tsx               ← /        (home)
//     about/page.tsx         ← /about
//   (auth)/
//     layout.tsx             ← layout de auth
//     sign-in/page.tsx       ← /sign-in
//   (app)/
//     layout.tsx             ← layout del área logueada
//     dashboard/page.tsx     ← /dashboard