import { SignUp } from '@clerk/nextjs'

const SignUpPage = () => {
  return <SignUp />
}

export default SignUpPage



/* <SignIn /> es el widget de inicio de sesión que trae Clerk (email/contraseña, SSO, 2FA, etc.).

No construyes el formulario a mano: Clerk pinta todo y gestiona validaciones, estados, errores y redirecciones.

Como la página está en sign-in/[[...sign-in]]/page.tsx, sirve para /sign-in y cualquier subruta del flujo (callbacks, pasos intermedios).

Por qué funciona así

Tu app/layout.tsx ya debe envolver con <ClerkProvider> y tienes el middleware.ts de Clerk: con eso, el widget sabe cómo autenticar y redirigir.

Aunque esta page.tsx es Server Component por defecto, <SignIn /> es un Client Component: Next crea una “frontera” y lo hidrata en el navegador automáticamente. */