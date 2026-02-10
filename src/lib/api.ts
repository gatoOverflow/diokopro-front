"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

type FetchOptions = {
  revalidate?: number | false;
  tags?: string[];
  cache?: RequestCache;
};

// Durée de cache par défaut : 60 secondes
const DEFAULT_REVALIDATE = 60;

export async function fetchJSON(url: string, options?: FetchOptions) {
  const token = (await cookies()).get("token")?.value;

  // Construire les options de cache Next.js
  const nextOptions: { revalidate?: number | false; tags?: string[] } = {};

  // Utiliser revalidate pour le caching intelligent
  // - Si options.revalidate est défini, l'utiliser
  // - Si options.cache === 'no-store', pas de cache (revalidate: 0)
  // - Sinon, utiliser le cache par défaut de 60 secondes
  if (options?.cache === 'no-store' || options?.revalidate === 0) {
    nextOptions.revalidate = 0;
  } else {
    nextOptions.revalidate = options?.revalidate ?? DEFAULT_REVALIDATE;
  }

  // Ajouter les tags pour l'invalidation ciblée
  if (options?.tags && options.tags.length > 0) {
    nextOptions.tags = options.tags;
  }

  try {
    const res = await fetch(`${url}`, {
      headers: {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : undefined
      } as HeadersInit,
      next: nextOptions,
    });

    if (res.ok) {
      return await res.json();
    }
    console.error(`API Error: ${res.status} for ${url}`);
    return [];
  } catch (error) {
    console.error(`Fetch Error for ${url}:`, error);
    return [];
  }
}

// Fonction pour invalider le cache par tag
export async function invalidateCache(tags: string | string[]) {
  const tagArray = Array.isArray(tags) ? tags : [tags];
  tagArray.forEach(tag => revalidateTag(tag));
}


export async function createdOrUpdated({
    url,
    data,
    updated = false,
    invalidateTags = []
}: {
    url: string;
    data: any;
    updated?: boolean;
    invalidateTags?: string[];
}) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        console.error("Token manquant !");
        throw new Error("Token manquant");
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    let res;
    try {
        if (!updated) {
            res = await axios.post(url, data, { headers });
        } else {
            res = await axios.put(url, data, { headers });
        }

        // Invalider le cache après mutation réussie
        if (invalidateTags.length > 0) {
            await invalidateCache(invalidateTags);
        }

        return res.data;
    } catch (error: any) {
        console.error("Erreur API :", error.response?.data || error.message);
        throw error;
    }
}
