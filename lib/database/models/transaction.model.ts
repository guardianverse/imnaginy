// lib/database/models/transaction.model.ts
import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

// Schema
const TransactionSchema = new Schema(
  {
    createdAt: { type: Date, default: Date.now },
    stripeId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    plan: { type: String },
    credits: { type: Number },
    buyer: { type: Schema.Types.ObjectId, ref: "User" },
  }
  // Si prefieres timestamps automáticos, usa: , { timestamps: true }
  // y elimina el campo createdAt manual de arriba.
);

// Tipo inferido desde el schema
export type ITransaction = InferSchemaType<typeof TransactionSchema>;

// Modelo tipado (evita la unión “too complex to represent”)
let Transaction: Model<ITransaction>;
try {
  // Si ya existe el modelo, lo obtenemos sin pasar schema
  Transaction = mongoose.model<ITransaction>("Transaction");
} catch {
  // Si no existe, lo creamos
  Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
}

export default Transaction;
