"use server";

import { fetchJSON } from "@/lib/api";
import { PAYMENT_METHODS_URL, PAYOUT_METHODS_URL } from "./endpoint";

export interface PaymentMethod {
  code: string;
  name: string;
  country: string | null;
  country_name: string | null;
  currency: string;
  flow?: string;
  logo_url?: string;
  min_amount?: number | null;
  max_amount?: number | null;
  requires_otp?: boolean;
}

export interface Country {
  code: string;
  name: string;
}

interface CatalogResponse {
  data: PaymentMethod[];
  meta: { countries: Country[]; count: number };
}

const VIDE: CatalogResponse = { data: [], meta: { countries: [], count: 0 } };

/**
 * Le catalogue bouge très rarement : on le met en cache une heure plutôt que
 * de réinterroger l'API à chaque ouverture de formulaire.
 */
const OPTIONS = { revalidate: 3600, tags: ["payment-methods"] };

function url(base: string, country?: string) {
  return country ? `${base}?country=${encodeURIComponent(country)}` : base;
}

/** Moyens d'ENCAISSEMENT : comment un client règle sa facture. */
export async function getPaymentMethods(country?: string): Promise<CatalogResponse> {
  try {
    const reponse = await fetchJSON(url(PAYMENT_METHODS_URL, country), OPTIONS);
    return reponse?.data ? reponse : VIDE;
  } catch (error) {
    // Le catalogue ne doit jamais empêcher d'ouvrir le formulaire :
    // sans moyen choisi, le client reçoit un lien de paiement classique.
    console.error("Catalogue d'encaissement indisponible:", error);
    return VIDE;
  }
}

/** Moyens de VERSEMENT : sur quel portefeuille l'agent est payé. */
export async function getPayoutMethods(country?: string): Promise<CatalogResponse> {
  try {
    const reponse = await fetchJSON(url(PAYOUT_METHODS_URL, country), OPTIONS);
    return reponse?.data ? reponse : VIDE;
  } catch (error) {
    console.error("Catalogue de versement indisponible:", error);
    return VIDE;
  }
}
