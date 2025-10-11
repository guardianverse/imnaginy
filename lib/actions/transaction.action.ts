"use server";
// ndica a Next.js que todo este archivo son Server Actions (solo se ejecutan en el servidor). Aquí puedes usar claves privadas (Stripe, DB), redirect, etc.
import { redirect } from 'next/navigation'
import Stripe from "stripe";
import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits } from './user.actions';
// redirect: redirige desde el servidor (responde al cliente con 3xx).
// Stripe: SDK de Stripe para crear sesiones de pago.
// handleError: tu manejador/log de errores.
// connectToDatabase: abre (o reutiliza) la conexión a Mongo.
// Transaction: modelo Mongoose de transacciones (stripeId, amount, buyer, etc.).
// updateCredits: acción que suma créditos al usuario.

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // Crea el cliente de Stripe con tu clave secreta (ENV). El ! le dice a TS “existe”.

  const amount = Number(transaction.amount) * 100;
// Convierte el importe a céntimos (Stripe espera la cantidad en la unidad más pequeña: USD → centavos).
// Ej.: 40 → 4000.
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: transaction.plan,
          }
        },
        quantity: 1
      }
    ],
    metadata: {
      plan: transaction.plan,
      credits: transaction.credits,
      buyerId: transaction.buyerId,
    },
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
  })
// Crea una sesión de Checkout alojada por Stripe:
// line_items.price_data: defines el precio al vuelo (moneda, unit_amount en centavos, nombre del plan).
// metadata: info útil que viaja con la sesión (plan, créditos a otorgar, id del comprador). La leerás en el webhook o al recuperar la sesión.
// mode: 'payment': pago único.
// success_url / cancel_url: a dónde volver tras pagar o cancelar. Usan NEXT_PUBLIC_SERVER_URL (dominio público).
  redirect(session.url!)
  // Redirige al usuario a la página de pago de Stripe. session.url es la URL que Stripe genera.
}
// Resumen de esta función: prepara el cobro (cantidad, producto) y envía al usuario a Stripe. No toca la base de datos aquí.


export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Asegura conexión a Mongo.

    // Create a new transaction with a buyerId
    const newTransaction = await Transaction.create({
      ...transaction, buyer: transaction.buyerId
    })
// Crea un documento Transaction en BD. Copia todos los campos de transaction y asigna buyer (ObjectId del usuario) desde buyerId.
    await updateCredits(transaction.buyerId, transaction.credits);
// Otorga créditos al usuario comprador.
    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error)
  }
  
//   Devuelve la transacción como objeto “plano” (serializable).
// Si hay fallo, lo centraliza handleError.
}


// Resumen de esta función: registra la compra y suma créditos al usuario.

// Variables de entorno necesarias

// STRIPE_SECRET_KEY (secreta, solo servidor).

// NEXT_PUBLIC_SERVER_URL (pública, usada para success_url/cancel_url).

// Cosas importantes a tener en cuenta

// Centavos: unit_amount debe ir en centavos (por eso multiplicas por 100). Cuidado con decimales (usa enteros o redondea).

// Seguridad/flujo real con Stripe: lo correcto es otorgar créditos al confirmar el pago desde el webhook checkout.session.completed (verificar firma). Esta función createTransaction asume que el pago es válido; en producción, llama a algo así solo tras verificar el evento del webhook.

// Idempotencia: en tu Transaction debes tener stripeId único para no crear transacciones duplicadas si Stripe reintenta notificaciones.

// Rutas permitidas: en el dashboard de Stripe, los dominios de success_url/cancel_url deben ser correctos (http/https, puerto si es local).

// redirect en server: corta la acción y envía al cliente un 303 a Stripe (no pongas lógica después de redirect).