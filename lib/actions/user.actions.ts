"use server";
// Indica a Next.js que todo el archivo son Server Actions (solo en servidor). Aquí puedes usar BD, claves privadas, revalidatePath, redirect, etc.
import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// connectToDatabase: abre/reutiliza la conexión Mongoose (evita múltiples conexiones).
// User: modelo Mongoose de usuarios.
// revalidatePath: invalida la caché de una ruta para que la UI se regenere.
// handleError: tu capturador/log de errores.
// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}
// Conecta a la BD.
// Crea un documento en users con los datos recibidos.
// Devuelve un objeto serializable (se “desmongoosea” con JSON.parse(JSON.stringify(...))).
// Alternativa más limpia en lecturas: usar .lean().
// Si el schema tiene unique: true (email/username), aquí puede saltar un error de índice si ya existe.
// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}
// Ojo al nombre del parámetro: aquí userId es el clerkId (id de Clerk), no el _id de Mongo.

// Busca por clerkId y devuelve el usuario o lanza error si no existe
// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}
// Actualiza por clerkId.

// { new: true } ⇒ devuelve el documento actualizado.

// Lanza error si no encuentra usuario.
// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}
// Localiza al usuario por clerkId y lo borra por su _id.
// Llama a revalidatePath("/") para refrescar la home (o la ruta que muestre la lista afectada).
// Nota: si existen documentos relacionados (imágenes, transacciones) y quieres “borrado en cascada”, habría que hacerlo aquí (o con middleware de Mongoose / transacción).

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee }},
      { new: true }
    )

    if(!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}

// Aquí userId sí es el _id de Mongo (no el clerkId).
// Usa $inc para sumar/restar créditos:
// positivo ⇒ añade créditos (p. ej., compra),
// negativo ⇒ descuenta créditos (p. ej., usar IA).
// (En tu proyecto vi un creditFee = -1; esto cuadra con “gastar 1 crédito por acción”.)
// Devuelve el usuario con saldo actualizado.