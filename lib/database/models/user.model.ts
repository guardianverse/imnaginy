// lib/database/models/user.model.ts
import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

// --- Schema ---
const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    photo: { type: String, required: true },

    firstName: { type: String },
    lastName: { type: String },

    planId: { type: Number, default: 1 },
    creditBalance: { type: Number, default: 10 },
  },
  { timestamps: true }
);

// --- Tipo TS inferido a partir del schema ---
export type IUser = InferSchemaType<typeof UserSchema>;

// --- Modelo tipado explícitamente usando try/catch (sin uniones complejas) ---
let User: Model<IUser>;
try {
  // Si el modelo ya existe, lo obtenemos (sin pasar schema)
  User = mongoose.model<IUser>("User");
} catch {
  // Si no existe, lo creamos con el schema
  User = mongoose.model<IUser>("User", UserSchema);
}

export default User;
