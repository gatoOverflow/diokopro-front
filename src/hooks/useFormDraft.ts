"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Brouillon de formulaire conserve dans le navigateur.
 *
 * Fermer une fenetre par erreur, rafraichir la page ou etre interrompu ne
 * doit pas faire perdre une saisie en cours.
 *
 * Le brouillon vit dans localStorage : il reste sur ce poste et ce
 * navigateur, il n'est pas visible par les collegues et ne remonte jamais au
 * serveur. C'est un filet de securite pour la personne qui saisit, pas un
 * partage d'informations.
 *
 * Deux garde-fous volontaires :
 *
 *  - Un brouillon expire (7 jours par defaut). Restaurer une saisie vieille
 *    de trois semaines creerait plus de confusion qu'autre chose.
 *  - Rien n'est enregistre tant que le formulaire est vide, sinon ouvrir puis
 *    fermer une fenetre laisserait un brouillon fantome.
 *
 * La restauration doit toujours etre signalee a l'utilisateur : reprendre des
 * donnees anciennes sans le dire l'exposerait a creer une fiche avec des
 * informations perimees sans s'en apercevoir.
 */

const PREFIXE = "dioko:brouillon:";
const DELAI_ECRITURE_MS = 600;

interface Enveloppe<T> {
  valeur: T;
  enregistreLe: number;
}

interface Options {
  /** Le brouillon n'est suivi que lorsque le formulaire est ouvert. */
  actif?: boolean;
  ttlJours?: number;
  /** Decide si la saisie merite d'etre conservee (formulaire non vierge). */
  meriteSauvegarde?: (valeur: unknown) => boolean;
}

/** localStorage peut jeter : navigation privee, quota, site data bloque. */
function lire<T>(cle: string): Enveloppe<T> | null {
  try {
    const brut = window.localStorage.getItem(PREFIXE + cle);
    return brut ? (JSON.parse(brut) as Enveloppe<T>) : null;
  } catch {
    return null;
  }
}

function ecrire<T>(cle: string, enveloppe: Enveloppe<T>) {
  try {
    window.localStorage.setItem(PREFIXE + cle, JSON.stringify(enveloppe));
  } catch {
    /* le formulaire doit rester utilisable meme sans stockage */
  }
}

function supprimer(cle: string) {
  try {
    window.localStorage.removeItem(PREFIXE + cle);
  } catch {
    /* idem */
  }
}

export function useFormDraft<T>(
  cle: string,
  valeur: T,
  appliquer: (valeur: T) => void,
  options: Options = {}
) {
  const { actif = true, ttlJours = 7, meriteSauvegarde } = options;

  const [brouillonRestaure, setBrouillonRestaure] = useState(false);
  const [dateBrouillon, setDateBrouillon] = useState<Date | null>(null);

  // Evite de restaurer en boucle : appliquer() modifie `valeur`, ce qui
  // relancerait l'effet.
  const dejaRestaure = useRef(false);
  const appliquerRef = useRef(appliquer);
  appliquerRef.current = appliquer;

  useEffect(() => {
    if (!actif) {
      dejaRestaure.current = false;
      return;
    }
    if (dejaRestaure.current) return;
    dejaRestaure.current = true;

    const enveloppe = lire<T>(cle);
    if (!enveloppe) return;

    const ageMs = Date.now() - enveloppe.enregistreLe;
    if (ageMs > ttlJours * 24 * 60 * 60 * 1000) {
      supprimer(cle);
      return;
    }

    appliquerRef.current(enveloppe.valeur);
    setDateBrouillon(new Date(enveloppe.enregistreLe));
    setBrouillonRestaure(true);
  }, [actif, cle, ttlJours]);

  useEffect(() => {
    if (!actif || !dejaRestaure.current) return;
    if (meriteSauvegarde && !meriteSauvegarde(valeur)) return;

    // Ecriture differee : inutile de toucher au stockage a chaque frappe
    const minuteur = setTimeout(() => {
      ecrire(cle, { valeur, enregistreLe: Date.now() });
    }, DELAI_ECRITURE_MS);

    return () => clearTimeout(minuteur);
  }, [actif, cle, valeur, meriteSauvegarde]);

  /** A appeler apres un envoi reussi, ou quand l'utilisateur abandonne. */
  const effacerBrouillon = useCallback(() => {
    supprimer(cle);
    setBrouillonRestaure(false);
    setDateBrouillon(null);
  }, [cle]);

  return { brouillonRestaure, dateBrouillon, effacerBrouillon };
}

/** "il y a 5 minutes", "hier a 14:30" — pour la banniere de restauration. */
export function formaterAnciennete(date: Date | null): string {
  if (!date) return "";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;

  return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}
