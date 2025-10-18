/* eslint-disable camelcase */
export const runtime = "nodejs";

// ¿Qué es un webhook?
// Un webhook es un aviso que un servicio externo te envía por HTTP POST cuando ocurre algo.
// Aquí, Clerk te avisa cuando:
// user.created (usuario nuevo)
// user.updated (actualizó perfil)
// user.deleted (borrado)
// Tu endpoint recibe ese POST, verifica la firma, y sincroniza tu BD 
// (crear/actualizar/borrar el usuario en Mongo). Es la manera de mantener 
// tu base de datos alineada con Clerk

import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
// Svix es quien firma los webhooks de Clerk. Con este objeto verificas que el POST lo envió Clerk (y nadie más).

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
// Tus Server Actions que crean/actualizan/borran el usuario en MongoDB.
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }
  
// WEBHOOK_SECRET lo copias del dashboard de Clerk al crear el endpoint.
// Sin este secreto no puedes verificar la firma → no proceses nada.
// Este archivo es app/api/webhooks/clerk/route.ts, así que esta función atiende POST /api/webhooks/clerk.
  // Svix headers
  const hdrs = headers();
  const svix_id = hdrs.get("svix-id");
  const svix_timestamp = hdrs.get("svix-timestamp");
  const svix_signature = hdrs.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", { status: 400 });
  }
// Clerk envía 3 cabeceras que se usan para verificar la firma. Si falta alguna → 400.
  // ⚠️ raw body para verificar firma
  const body = await req.text();
// Debe ser req.text() (cuerpo crudo).
// Si haces req.json() y luego JSON.stringify, cambias espacios/orden y rompes la verificación.
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", { status: 400 });
  }
// Con el secreto y las cabeceras, Svix verifica que el payload viene de Clerk.
// Si falla → no proceses (400).
// Si pasa, evt contiene el evento parseado y confiable.
  const eventType = evt.type;
// Ejemplos: "user.created", "user.updated", "user.deleted".
  // CREATE
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data as any;

    const email = email_addresses?.[0]?.email_address as string | undefined;
    if (!email) {
      return NextResponse.json({ message: "Missing email in Clerk event" }, { status: 400 });
    }

    const user = {
      clerkId: String(id),
      email,
      username: username ?? email.split("@")[0],
      firstName: first_name ?? undefined,
      lastName: last_name ?? undefined,
      photo: image_url ?? undefined, // si tu schema lo requiere, pon placeholder
    };

    const newUser = await createUser(user);

    if (newUser) {
      const clerk = await clerkClient(); // ← tu versión
      await clerk.users.updateUser(String(id), {
        publicMetadata: { userId: newUser._id.toString() },
      });
    }

    return NextResponse.json({ message: "OK", user: newUser });
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data as any;

    const payload = {
      firstName: first_name ?? undefined,
      lastName: last_name ?? undefined,
      username: username ?? undefined,
      photo: image_url ?? undefined,
    };

    const updatedUser = await updateUser(String(id), payload);
    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  // DELETE
  if (eventType === "user.deleted") {
    const { id } = evt.data as any;
    const deletedUser = await deleteUser(String(id));
    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  return new Response("", { status: 200 });
}

// Resumiendo lo que implementaste:
// Verifica la firma con Svix usando los headers svix-id, svix-timestamp, svix-signature y el secreto WEBHOOK_SECRET.
// (Muy importante: leer el raw body con req.text() para verificar correctamente.)
// Lee el evento (evt.type) y sus datos (evt.data).
// Según el tipo:
// user.created → construye un objeto de usuario (cuidando que first_name, last_name, username pueden ser null), llama a createUser(...) y opcionalmente actualiza publicMetadata en Clerk con el _id de Mongo.
// user.updated → updateUser(...).
// user.deleted → deleteUser(...).
// Devuelve 200 si todo va bien.




// Seguridad de webhook (Svix)
// Usa WEBHOOK_SECRET (desde el dashboard de Clerk).
// Lee headers svix-id, svix-timestamp, svix-signature.
// Verifica con el cuerpo crudo: const body = await req.text() + new Webhook(secret).verify(body, headers).
// Si falla, no proceses (400).
// Imports correctos (lado servidor)
// Todo lo de Clerk en server:
// import { WebhookEvent, clerkClient } from "@clerk/nextjs/server".
// En v6, clerkClient es async →
// const clerk = await clerkClient(); clerk.users.updateUser(...).
// Flujo por eventos
// user.created → crear usuario en tu BD (normaliza campos que pueden ser null: first_name, last_name, username, image_url).
// user.updated → actualizar en tu BD.
// user.deleted → borrar en tu BD.
// Sincronía de identidades
// Tras crear en tu BD, guarda el _id en publicMetadata de Clerk:
// await clerk.users.updateUser(id, {
//   publicMetadata: { userId: newUser._id.toString() }
// });
// Runtime
// Este handler debe correr en Node (usa Mongoose/Svix):
// export const runtime = "nodejs" (si no lo tienes en otra parte).
// Respuestas
// Devuelve NextResponse.json({ ... }) con 200 en OK y 400/500 en error.


// Errores comunes que sí conviene recordar
// ❌ Usar req.json() en vez de req.text() → rompe la verificación.
// ❌ Importar desde @clerk/nextjs (cliente) en vez de @clerk/nextjs/server.
// ❌ Suponer que first_name/last_name/username siempre vienen (pueden ser null).
// ❌ Guardar ObjectId crudo en metadata (mejor toString()).
// ❌ Correr esto en Edge.