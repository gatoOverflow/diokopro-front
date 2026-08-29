"use client";

import { FileClock, X } from "lucide-react";
import { formaterAnciennete } from "@/hooks/useFormDraft";

interface DraftBannerProps {
  visible: boolean;
  date: Date | null;
  onEffacer: () => void;
}

/**
 * Signale qu'une saisie interrompue vient d'etre restauree.
 *
 * Restaurer sans le dire exposerait a creer une fiche avec des informations
 * anciennes sans s'en apercevoir : la banniere rend la reprise visible et
 * offre de repartir de zero en un clic.
 */
export const DraftBanner = ({ visible, date, onEffacer }: DraftBannerProps) => {
  if (!visible) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <FileClock className="h-5 w-5 shrink-0 text-amber-500" />
      <p className="flex-1 text-sm text-amber-900">
        Brouillon repris — saisie enregistrée {formaterAnciennete(date)}.
      </p>
      <button
        type="button"
        onClick={onEffacer}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-amber-700 hover:bg-amber-100"
      >
        <X className="h-4 w-4" />
        Repartir de zéro
      </button>
    </div>
  );
};
