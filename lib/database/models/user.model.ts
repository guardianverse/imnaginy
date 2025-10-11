import { Schema, model, models } from "mongoose";
// Traes de Mongoose:
// Schema: define la forma del documento.
// model: “compila” el schema en un Modelo (API para consultar/guardar).
// models: registro de modelos ya creados (sirve para reutilizar en Next y evitar errores en hot-reload).

const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
//   clerkId: ID del usuario en Clerk (tu proveedor de auth).
// required: true: obligatorio al crear.
// unique: true: crea un índice único en Mongo (no permite dos usuarios con el mismo clerkId). Ojo: unique no es una validación de Mongoose, es un índice; si ya hay duplicados, el índice fallará al crearse.
  email: {
    type: String,
    required: true,
    unique: true,
  },
//   Email del usuario. Obligatorio y único.
// Suele ser buena idea añadir lowercase: true, trim: true para normalizar.
  username: {
    type: String,
    required: true,
    unique: true,
  },
  // Alias público. Obligatorio y único. También conviene trim: true y, si lo necesitas, normalizar a minúsculas.
  // URL de la foto/avatar (p. ej. la que da Clerk). Obligatoria.
  photo: {
    type: String,
    required: true,
  },
  // URL de la foto/avatar (p. ej. la que da Clerk). Obligatoria.
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  // Nombre y apellidos (opcionales).
  planId: {
    type: Number,
    default: 1,
  },
//   Identificador numérico de tu plan (p. ej. enlaza con tus plans de constants).
// Por defecto 1 (seguramente “Free”).
  creditBalance: {
    type: Number,
    default: 10,
  },
  // Saldo de créditos del usuario. Por defecto 10 al registrarse.
});

const User = models?.User || model("User", UserSchema);
// Patrón para Next.js:
// Si models.User ya existe, lo reusa.
// Si no existe, crea el modelo con el schema.
// Evita OverwriteModelError en desarrollo/hot-reload.
// El nombre "User" hace que la colección sea users (Mongoose pluraliza).

export default User;
// Exportas el Modelo para hacer queries: User.find(), User.create(), etc.