"use server";
// Le dice a Next.js que todo el archivo se ejecuta en el servidor (puede usar claves privadas, BD, revalidatePath, redirect, etc.).
// Este archivo define Server Actions (funciones que solo corren en el servidor) para crear, leer, actualizar y borrar imágenes, además de listar con búsqueda/paginación apoyándose en MongoDB (Mongoose) y Cloudinary.

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary'
// connectToDatabase: abre una única conexión Mongoose (con caché global).
// revalidatePath(path): invalida la caché de esa ruta para que se regenere al instante (ISR/RSC).
// redirect: corta la acción y redirecciona.
// cloudinary: SDK para buscar ficheros en tu carpeta de Cloudinary.
// handleError: tu capturador/log de errores (centraliza respuesta/log).

const populateUser = (query: any) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
})
// Helper: aplica populate de Mongoose a un Query para que el campo author (ObjectId) venga resuelto como objeto User con solo esos campos.

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    })

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error)
  }
}
// Valida que el autor exista y guarda la imagen con author._id.
// Luego revalida la ruta (por ejemplo / o /profile) para que la UI muestre el nuevo item.
// JSON.parse(JSON.stringify(...)): convierte el documento de Mongoose en POJO (evita métodos y referencias no serializables). Alternativa más limpia: .lean() en las lecturas.

// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    )

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error)
  }
}
// Busca la imagen y autoriza: solo el autor puede editar (author.toHexString() === userId).
// Actualiza y devuelve el documento nuevo ({ new: true }).
// Revalida la ruta afectada para refrescar la UI.
// Nota: si tu ImageSchema no tiene { timestamps: true }, updatedAt no se actualizará automáticamente con findByIdAndUpdate.

// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error)
  } finally{
    redirect('/')
  }
}
// Elimina por id.
// finally { redirect('/') } siempre redirige a / (aun con error). Si prefieres no redirigir en error, mueve el redirect fuera del finally.
// GET IMAGE
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if(!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error)
  }
}
// Lee la imagen y puebla author con _id, firstName, lastName, clerkId.
// GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    let expression = 'folder=imaginify';

    if (searchQuery) {
      expression += ` AND ${searchQuery}`
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    let query = {};

    if(searchQuery) {
      query = {
        publicId: {
          $in: resourceIds
        }
      }
    }

    const skipAmount = (Number(page) -1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);
    
    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    }
  } catch (error) {
    handleError(error)
  }
}
// Configura Cloudinary con env vars (clave secreta solo en servidor).
// Construye una expresión de búsqueda (folder=imaginify AND ...) y ejecuta cloudinary.search.
// Si hay searchQuery, filtra Mongo por los publicId devueltos por Cloudinary.
// Aplica paginación (skip/limit) y orden (updatedAt descendente).
// Devuelve datos + total de páginas.
// Detalle: el campo devuelto se llama totalPage, pero en otra acción devuelves totalPages. Unifícalo.
// Sugerencias:
// Valida/normaliza searchQuery (la cadena va directo a Cloudinary search; usa un formato controlado).
// Considera .lean() para lecturas y evitar el stringify.

// GET IMAGES BY USER
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
// Lista solo las imágenes cuyo author es userId, con paginación y populate del autor. 
// Devuelve totalPages (nómbrelo igual que en getAllImages).






// ¡Genial! Esa carpeta actions/ y el archivo image.actions.ts suelen usarse en Next.js (App Router) para guardar la lógica del servidor relacionada con “imagenes” en un sitio central.
// ¿Qué es actions/?
// Es convención (nombre libre). Sirve para agrupar Server Actions o funciones del lado servidor que:
// hablan con la BD (Mongoose),
// validan datos,
// llaman a APIs externas (Cloudinary/Stripe…),
// y luego devuelven datos o revalidan páginas.

// Son funciones del servidor que puedes:
// Usar en componentes de servidor (se importan normal).
// Conectar a formularios como action={createImage}.
// Desde componentes cliente, invocarlas indirectamente (por un form, o mediante un endpoint /api/...).
// Una Server Action debe llevar la directiva "use server" en el archivo o dentro de la función.
// ¿Por qué separarlas en actions/?

// Orden: la UI queda limpia; la lógica de negocio vive en un lugar.
// Seguridad: el código se ejecuta solo en servidor (claves privadas seguras).
// Reutilización: la misma acción se usa desde varias páginas/segmentos.
// Caché/SSR: puedes llamar revalidatePath, redirect, etc.

// "use server": asegura que estas funciones no viajan al cliente (seguras para secretos y BD).
// connectToDatabase(): una sola conexión para todo el proceso/instancia (evita “too many connections”).
// populateUser: reduce duplicación y limita campos del usuario (menos datos, mejor privacidad).
// revalidatePath(path): en Next (App Router) refresca la caché de la página/lista afectada tras crear/actualizar.
// JSON.parse(JSON.stringify(doc)): devuelve objetos planos (serializables). Alternativa: .lean() en las queries.
// Cloudinary + Mongo: Cloudinary filtra por recursos reales (carpeta/expresión), y Mongo trae solo los documentos que corresponden a esos publicId y aplica populate/paginación.
// redirect en finally: asegura redirección tras borrar, incluso con error (decide si es lo que quieres).