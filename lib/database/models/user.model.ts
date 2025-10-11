// lib/database/models/user.model.ts
import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

// --- Schema ---
const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    photo:    { type: String, required: true },

    firstName:{ type: String },        // opcional
    lastName: { type: String },        // opcional

    planId:        { type: Number, default: 1 },
    creditBalance: { type: Number, default: 10 },
  },
  { timestamps: true }
);

// --- Tipo TS inferido a partir del schema ---
export type IUser = InferSchemaType<typeof UserSchema>;

// --- Modelo tipado explícitamente ---
// (evita la unión “too complex to represent”)
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
