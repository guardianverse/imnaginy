import { Schema, model, models } from "mongoose";
// Traes de Mongoose:
// Schema: para definir la forma del documento.
// model: para crear el modelo (API de consultas).
// models: registro de modelos ya creados (sirve para reutilizarlos en Next y evitar errores en hot-reload).

const TransactionSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
//   Campo fecha de creación.
// default: Date.now (sin paréntesis) ⇒ Mongoose ejecuta la función al insertar y guarda el momento actual.
  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
//   ID de Stripe (p. ej., payment_intent o checkout_session).
// required: true ⇒ obligatorio.
// unique: true ⇒ crea un índice único; evita duplicados (útil para no procesar dos veces el mismo webhook).

  amount: {
    type: Number,
    required: true,
  },
  // Importe pagado (normalmente en la unidad más pequeña, p. ej. céntimos).
  plan: {
    type: String,
  },
  // Información del plan comprado y créditos otorgados (opcionales).
  credits: {
    type: Number,
  },

  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  //   Referencia al usuario comprador.
// Se guarda un ObjectId; con .populate('buyer') puedes traer el usuario completo (nombre, email, etc.).

});

const Transaction = models?.Transaction || model("Transaction", TransactionSchema);
//   Patrón para reusar el modelo si ya existe (evita OverwriteModelError en Next).
// Si no existe, lo crea con el Schema.
// Nombre "Transaction" ⇒ la colección será transactions (Mongoose pluraliza).

export default Transaction;

// Exporta el modelo para usarlo: Transaction.find(), Transaction.create(), etc.