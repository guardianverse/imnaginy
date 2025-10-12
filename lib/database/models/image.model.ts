// import { Document, Schema, model, models } from "mongoose";

// export interface IImage extends Document {
//   title: string;
//   transformationType: string;
//   publicId: string;
//   secureURL: string; 
//   width?: number;
//   height?: number;
//   config?: object; 
//   transformationUrl?: string; 
//   aspectRatio?: string;
//   color?: string;
//   prompt?: string;
//   author: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//   }
//   createdAt?: Date;
//   updatedAt?: Date;
// }


// interface IImage: defines un tipo de TypeScript (solo para el compilador, no existe en runtime).
// extends Document: hereda (extiende) todo lo que trae el tipo Document de Mongoose y, además, le podrás añadir tus propios campos (title, publicId, etc.).
// ¿Qué es Document (de Mongoose)?
// Es el tipo base de un documento de Mongoose. Aporta cosas como:
// Propiedades comunes: _id, __v, etc.
// Métodos de documento: .save(), .toObject(), .populate(), .remove(), etc.
// Al extender de Document, tu IImage tiene:
// Tus campos (title, transformationType, …)
// Mini analogía
// extends = “IImage es como Document, pero con más cosas”.

// Y los de un documento Mongoose ( _id, métodos de documento… )
// width?: number → la propiedad puede faltar (o existir con valor number).
// width: number | undefined → la propiedad siempre existe, pero su valor puede ser number o undefined.

// const ImageSchema = new Schema({
//   title: { type: String, required: true },
//   transformationType: { type: String, required: true },
//   publicId: { type: String, required: true },
//   secureURL: { type: String, required: true },
//   width: { type: Number },
//   height: { type: Number },
//   config: { type: Object },
//   transformationUrl: { type: String },
//   aspectRatio: { type: String },
//   color: { type: String },
//   prompt: { type: String },
//   author: { type: Schema.Types.ObjectId, ref: 'User' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// Un Schema de Mongoose: define la forma, tipo y reglas de los documentos que guardarás en la colección (por ejemplo, images). Con este schema luego creas el modelo: model('Image', ImageSchema).

// Cómo se lee (reglas generales)
// Cada clave (title, width, …) es un campo del documento.
// type: … define el tipo: String, Number, Date, Schema.Types.ObjectId, etc.
// required: true ⇒ el campo es obligatorio al crear/guardar.
// default: … ⇒ valor por defecto si no lo envías.
// ref: 'User' ⇒ el ObjectId apunta a la colección/modelo User (sirve para populate).
// Campo por campo (simple)
// title: { type: String, required: true }
// Título obligatorio de la imagen.
// transformationType: { type: String, required: true }
// Tipo de transformación aplicada (p. ej. "restore", "fill", etc.) obligatorio.
// publicId: { type: String, required: true } / secureURL: { type: String, required: true }
// Identificador y URL (por ejemplo de Cloudinary) obligatorios.
// width, height (Number, opcionales)
// Dimensiones resultantes o del original.
// config: { type: Object } (opcional)
// Parámetros de la transformación. Nota: mejor usar Schema.Types.Mixed si quieres guardar objetos libres:
// config: { type: Schema.Types.Mixed }
// transformationUrl, aspectRatio, color, prompt (String, opcionales)
// Metadatos adicionales de la operación.
// author: { type: Schema.Types.ObjectId, ref: 'User' }
// Referencia al usuario creador. En la BD se guarda solo el id del usuario; con .populate('author') puedes traer el documento de User (nombre, etc.).
// createdAt: { type: Date, default: Date.now }
// Fecha de creación; si no la pasas, se pone la fecha actual.
// updatedAt: { type: Date, default: Date.now }
// Última actualización; aquí queda fija salvo que tú la actualices. Más cómodo usar timestamps automáticos (abajo).



// const Image = models?.Image || model('Image', ImageSchema);

// models: objeto de Mongoose que guarda todos los modelos ya compilados en la conexión actual (por nombre). Viene de import { model, models } from 'mongoose'.
// models?.Image: intenta leer el modelo llamado "Image" del registro.
// Si ya existe (p. ej., por hot-reload de Next o múltiples imports): úsalo.
// Si no existe: es undefined.
// || (OR): si lo de la izquierda es undefined/falsy, evalúa la derecha.
// model('Image', ImageSchema): crea (compila) el modelo "Image" con ese esquema por primera vez.
// En la práctica (paso a paso)
// Primera carga del archivo
// models.Image no existe → se ejecuta model('Image', ImageSchema) → se crea el modelo.
// Siguientes cargas (hot reload, otros imports)
// models.Image ya existe → se usa ese mismo modelo → no se vuelve a crear.
// ¿Por qué es necesario?
// En desarrollo con Next.js (App Router) hay recargas y el código se importa varias veces.
// Si llamaras siempre a model('Image', ...), Mongoose lanzaría:
// OverwriteModelError: Cannot overwrite Image model once compiled

// export default Image;



// Importas lo necesario de Mongoose:
// Schema: define la forma/validación de tus documentos.
// model: crea un Modelo para consultar/guardar.
// models: registro global de modelos ya creados (útil en Next para evitar errores por recarga).
// Document: tipo base que Mongoose añade a cada documento ( _id, métodos, etc.).

// nterfaz TypeScript: describe cómo esperas usar los datos de imagen en tu código.

// Lo obligatorio: title, transformationType, publicId, secureURL, author (según esta interfaz).

// Lo opcional (?): width, height, config, transformationUrl, aspectRatio, color, prompt, createdAt, updatedAt.

// ⚠️ Ojo: en el schema (más abajo) author es ObjectId que referencia a User, pero aquí lo tipeas como un objeto con { _id, firstName, lastName }.
// Eso solo es cierto tras un populate('author'). Más correcto sería tiparlo como Types.ObjectId | IUser (o una unión “no poblado / poblado”).


// Como a veces tendrás id y otras el objeto poblado, el tipo más realista es una unión:
// import { Types } from 'mongoose';
// import type { IUser } from './user.model'; // tu tipo de usuario
// author: Types.ObjectId | IUser;
// Si no hiciste populate, será Types.ObjectId.
// Si sí hiciste populate, será IUser (y podrás leer firstName, etc.)
// ¿Solo necesitas saber “quién es” (id)? → No hagas populate (más rápido).

// ¿Necesitas nombre/apellidos/foto del autor? → Sí usa populate('author', 'firstName lastName image').

// populate es una función de Mongoose (no de MongoDB “puro”). Sirve para reemplazar un ObjectId de referencia por el documento completo al que apunta.

// ¿Para qué sirve?
// Cuando en tu esquema guardas una referencia:
// // Post: cada post tiene un autor
// author: { type: Schema.Types.ObjectId, ref: 'User' }
// En la BD se guarda solo el id del usuario. Si haces:
// const post = await Post.findById(id);
// post.author          // → ObjectId (no tienes nombre, email, etc.)
// Con populate('author') Mongoose hace otra consulta a users y sustituye ese id por el usuario
// Requisitos para que funcione
// En el schema debe haber un campo con type: ObjectId y ref: 'NombreDelModelo'.
// En la consulta, llamas a .populate('campoRef').

// Cuando digo “documento completo” me refiero a un documento de MongoDB entero (el registro guardado en la colección), no solo su _id.
// En MongoDB, un documento es un objeto tipo JSON (BSON) con sus campos y un _id único.


// Sin populate
// Lo que recibes en image.author es solo el ObjectId:
// {
//   "_id": "img1",
//   "title": "Foto",
//   "author": "66f1c6a1b0a8c0ef..."   // <- solo el id
// }

// Con populate('author')
// Mongoose hace otra consulta a users y sustituye el id por el documento del usuario (eso es el “documento completo”):
// {
//   "_id": "img1",
//   "title": "Foto",
//   "author": {
//     "_id": "u123",
//     "firstName": "Ana",
//     "lastName": "Pérez",
//     "email": "ana@example.com",
//     "image": "https://…",
//     "credits": 20,
//     "createdAt": "...",
//     "updatedAt": "..."
//   }
// }
// Ojo: puedes no traer todos los campos si quieres.
// populate('author', 'firstName lastName') devuelve el documento poblado, pero solo con esos campos:
// "author": { "_id": "u123", "firstName": "Ana", "lastName": "Pérez" }


// Porque se hizo un populate('author'): la base guardaba solo el id del autor, y populate fue a la colección de usuarios y rellenó todos sus datos ahí dentro.
// Sin populate → sería:
// {
//   "_id": "img1",
//   "title": "Foto",
//   "author": "u123"   // solo el id
// }
// Con populate → ves todo el objeto usuario (el ejemplo de arriba).



// Sí, así es: primero defines el Schema y luego “compilas” el Model con model('Image', ImageSchema).
// Qué es cada cosa
// Schema (ImageSchema): el molde (qué campos hay, tipos, validaciones, índices…).
// Model (Image): la herramienta creada a partir del schema y de la conexión; te da los métodos para la BD (find, create, update, …) y queda ligada a una colección (con el nombre pluralizado: "Image" → images)

// lib/database/models/image.model.ts
import mongoose, {
  Schema,
  type Model,
  type InferSchemaType,
} from "mongoose";

// --- Schema ---
const ImageSchema = new Schema(
  {
    title: { type: String, required: true },
    transformationType: { type: String, required: true },
    publicId: { type: String, required: true },
    secureURL: { type: String, required: true },

    width: { type: Number },
    height: { type: Number },
    // Mixed para objetos arbitrarios
    config: { type: Schema.Types.Mixed },

    transformationUrl: { type: String },
    aspectRatio: { type: String },
    color: { type: String },
    prompt: { type: String },

    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  // timestamps añade createdAt/updatedAt automáticos
  { timestamps: true }
);

// --- Tipo TS inferido desde el schema ---
export type IImage = InferSchemaType<typeof ImageSchema>;

// --- Modelo tipado con try/catch (evita la unión “too complex”) ---
let ImageModel: Model<IImage>;
try {
  // Si ya existe, lo obtenemos sin pasar schema
  ImageModel = mongoose.model<IImage>("Image");
} catch {
  // Si no existe, lo creamos
  ImageModel = mongoose.model<IImage>("Image", ImageSchema);
}

export default ImageModel;
