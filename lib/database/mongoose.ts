import mongoose, { Mongoose } from 'mongoose';
// Importa el módulo mongoose y el tipo Mongoose.
// mongoose.connect(...) devuelve un objeto Mongoose (no “connection” simple), de ahí el tipo.

const MONGODB_URL = process.env.MONGODB_URL;
// Lee la URI de MongoDB desde variables de entorno (tu .env.local).
// Asegúrate de tener algo como:
// MONGODB_URL="mongodb+srv://usuario:pass@cluster/tu-db?retryWrites=true&w=majority"

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}
// Define un tipo para guardar en caché la conexión:
// conn: la instancia Mongoose ya conectada.
// promise: la promesa en curso de mongoose.connect(...), para reutilizarla si hay varias llamadas simultáneas.
// dice a TypeScript: “estas propiedades pueden estar vacías (null) hasta que se establezcan”.
// Inicial (nada conectado):
// { conn: null, promise: null }
// Conectando (ya se llamó a mongoose.connect):
// { conn: null, promise: Promise<Mongoose> }
// Conectado (la promesa se resolvió):
// { conn: Mongoose, promise: Promise<Mongoose> } // algunos ponen promise a null aquí, otros

let cached: MongooseConnection = (global as any).mongoose
// Intenta leer de global (Node) si ya guardaste una conexión antes.
// En desarrollo (hot reload) y en serverless, el módulo puede ejecutarse varias veces; lo que pongas en global sobrevive a esos reloads/instancias.
// En Node.js, global (o globalThis) es el objeto global que vive mientras el proceso está en memoria (parecido a window en el navegador).
// Cualquier cosa que guardes en global permanece entre imports, hot reloads (modo dev) o reusos de la misma instancia (serverless “warm”).
// ¿Qué hace esa asignación?
// Intenta leer una propiedad llamada mongoose que previamente guardaste en el objeto global.
// La idea es: “si ya tengo una conexión (o una promesa de conexión) guardada en global.mongoose, úsala; si no, la crearé luego.”
// Por qué (global as any)?
// TypeScript no sabe que global tiene una propiedad mongoose (no forma parte del tipo estándar de global).
// Escribes (global as any) para saltarte el chequeo de tipos en esa expresión y poder acceder a .mongoose sin que TS se queje.
// Más “bonito” sería declarar el tipo de esa propiedad en el ámbito global (te lo dejo abajo).
// ¿Por qué hacer esto en Next/Mongoose?
// En Next.js (App Router), durante el desarrollo hay hot reload: los módulos se vuelven a cargar y, si no cachearas la conexión, terminarías abriendo muchas conexiones a MongoDB → errores tipo “too many connections”.
// Guardar { conn, promise } en global.mongoose te permite:
// Reusar la misma conexión si ya existe (cached.conn).
// Reusar la misma promesa si varias partes intentan conectar al mismo tiempo (cached.promise).

if(!cached) {
  cached = (global as any).mongoose = { 
    conn: null, promise: null 
  }
}
// conn: Mongoose | null
// Guarda la instancia de Mongoose ya conectada (lo que devuelve await mongoose.connect(...)).
// Está lista para usar con tus modelos (User.find(), etc.).
// null significa que aún no hay conexión disponible.
// promise: Promise<Mongoose> | null
// Si es la primera vez, inicializa en global.mongoose el objeto de caché.
// Así evitas abrir múltiples conexiones a Mongo cada vez que el código se recarga o cada request crea una instancia nueva del módulo.
// No hay nada aún
// conn = null
// promise = null
// Empiezas a conectar
// promise = mongoose.connect(URI, opts) // devuelve Promise<Mongoose>
// conn = null                           // aún no hay conexión usable
// Cuando la promesa se resuelve (await)
// conn = await promise                  // ahora sí tienes la conexión (Mongoose)
// // opcional: promise puede quedar como la misma promesa resuelta o resetearse a null
// ¿Por qué existen las dos?
// promise: evita abrir varias conexiones en paralelo. Si otra parte del código llama a connectToDatabase() mientras ya estás conectando, reutiliza la misma promesa y se queda esperando a que termine.
// conn: una vez conectó, permite devolver inmediatamente la conexión en llamadas futuras sin volver a connect.

export const connectToDatabase = async () => {
  if(cached.conn) return cached.conn;  //Si ya hay conexión establecida, devuélvela y listo (no vuelves a conectar).

  if(!MONGODB_URL) throw new Error('Missing MONGODB_URL');   // Seguridad: si no hay URI, lanza error claro para que lo arregles en .env.

  cached.promise = 
    cached.promise || 
    mongoose.connect(MONGODB_URL, { 
      dbName: 'imnaginy', bufferCommands: false 
    })
//     Si no existe una promesa en curso, crea una nueva conexión:
// dbName: 'imaginify' → fuerza la base dentro del cluster (útil cuando la URI no la trae fija).
// bufferCommands: false → Mongoose por defecto “almacena” operaciones si aún no se conectó; con false desactivas ese buffer (si llamas a un modelo sin conexión, fallará en vez de acumular).
// Si ya existe cached.promise, la reutilizas (evita lanzar 2 conexiones en paralelo por dos llamadas cercanas).
// Evalúa cached.promise
// Si ya existe (no es null/undefined), es un valor truthy ⇒ el operador || se queda con la izquierda y no ejecuta mongoose.connect(...).
// Si no existe (está null), es falsy ⇒ evalúa la derecha y llama a mongoose.connect(...).
// Asigna el resultado
// El resultado (la promesa devuelta por mongoose.connect(...) o la que ya había) se guarda en cached.promise.
// Efecto práctico
// Primera llamada: cached.promise es null ⇒ crea la promesa de conexión y la guarda.
// Llamadas simultáneas (mientras la primera aún conecta): ven cached.promise ya definida ⇒ reutilizan la misma promesa (no abren otra conexión).
// Más tarde, haces:
// cached.conn = await cached.promise;
// y te queda la conexión lista en cached.conn.
// Este patrón se llama a veces single-flight: evita la “estampida” de conexiones.
// Por qué es útil en Next.js
// En dev (hot reload) y en serverless, tu módulo puede ejecutarse varias veces. Sin esta caché, abrirías múltiples conexiones a Mongo → errores y consumo innecesario.
// Sobre las opciones de connect
// dbName: 'imaginify'
// Fuerza el nombre de la base a usar dentro del cluster, aunque la URI no lo traiga.
// bufferCommands: false
// Mongoose por defecto bufferiza operaciones si aún no hay conexión; con false falla temprano si intentas usar un modelo sin conectar (mejor para detectar errores y evitar memoria colgada).

  cached.conn = await cached.promise;

  return cached.conn;
  // Espera a que se resuelva la promesa, guarda la instancia conectada y la devuelve.
}


// ¿Por qué este patrón es importante en Next.js?
// Hot Reload (dev): cada vez que cambias código, Next vuelve a cargar módulos; sin caché global acabarías con muchas conexiones abiertas.
// Serverless / Lambdas: cada invocación puede crear nuevo contexto; si el proveedor reusa contenedores, global persiste y reaprovechas la conexión.
// Evita “too many connections” y acelera requests posteriores



// Para deduplicar conexiones concurrentes:
// 1ª llamada: crea cached.promise = mongoose.connect(...).
// Llamadas que llegan mientras conecta: reutilizan esa misma promesa (no abren otra conexión).
// Cuando se resuelve, asignas cached.conn y ya la tienes lista.
// ¿Qué pasa cuando conecta bien?
// La promesa queda en estado resuelto (fulfilled).
// Puedes dejar cached.promise apuntando a esa promesa resuelta o, si quieres, ponerla a null; lo importante es que cached.conn ya está listo y siguientes llamadas pueden devolverlo al instante:
// ¿Y si falla la conexión?
// La promesa queda en rejected.
// Conviene resetear para permitir reintentos: