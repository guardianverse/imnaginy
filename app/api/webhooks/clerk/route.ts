/* eslint-disable camelcase */
export const runtime = "nodejs";

import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Svix headers
  const hdrs = headers();
  const svix_id = hdrs.get("svix-id");
  const svix_timestamp = hdrs.get("svix-timestamp");
  const svix_signature = hdrs.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", { status: 400 });
  }

  // ⚠️ raw body para verificar firma
  const body = await req.text();

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

  const eventType = evt.type;

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
