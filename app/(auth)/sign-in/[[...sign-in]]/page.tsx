import { SignIn } from '@clerk/nextjs'

const SignInPage = () => {
  return <SignIn />
}

export default SignInPage





// Qué significa [[...algo]]

// [id] → un segmento dinámico obligatorio: /users/[id] → /users/123

// [...slug] → “catch-all” obligatorio (captura varios niveles): /docs/a/b

// [[...slug]] → “catch-all” opcional: funciona para /ruta y /ruta/lo-que-sea/aqui

// En tu caso, sign-in/[[...sign-in]] hace que la misma página responda a:

// /sign-in

// /sign-in/anything (por ejemplo /sign-in/verify-email, /sign-in/sso-callback, etc.)

// ¿Por qué Clerk lo usa así?

// Los flujos de autenticación (SSO, verificación, restablecer, callbacks…) a veces redirigen a subrutas de sign-in.
// Si solo tuvieras app/(auth)/sign-in/page.tsx, esas subrutas darían 404.
// Con app/(auth)/sign-in/[[...sign-in]]/page.tsx, todas esas variantes caen en el mismo componente <SignIn />, que internamente sabe en qué “paso” estás según la URL.