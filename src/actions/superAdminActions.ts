"use server";

import { z } from "zod";
import { createdOrUpdated, fetchJSON } from "@/lib/api";
import {
  SUPERADMIN_UPDATE_ENTREPRISE_URL,
  SUPERADMIN_AJUSTER_SOLDE_URL,
  SUPERADMIN_TRANSACTIONS_URL,
  SUPERADMIN_AUDIT_LOG_URL,
  SUPERADMIN_ENTREPRISE_DETAILS_URL,
  SUPERADMIN_ENTREPRISES_PAGINATED_URL,
  SUPERADMIN_CANDIDATURES_PAGINATED_URL
} from "./endpoint";

// ========== SCHEMAS DE VALIDATION ==========

const UpdateEntrepriseBySuperAdminSchema = z.object({
  entrepriseId: z.string().min(1, "L'ID de l'entreprise est obligatoire"),
  nomEntreprise: z.string().min(1, "Le nom de l'entreprise est requis").optional(),
  emailEntreprise: z.string().email("Email invalide").optional().or(z.literal("")),
  telephoneEntreprise: z.string().optional(),
  adresse: z.string().optional(),
  ninea: z.string().optional(),
  rccm: z.string().optional(),
  representéPar: z.string().optional(),
  supportFees: z.boolean().optional(),
  logo: z.string().optional()
});

const AjusterSoldeSchema = z.object({
  entrepriseId: z.string().min(1, "L'ID de l'entreprise est obligatoire"),
  montant: z.number().min(1, "Le montant doit être supérieur à 0"),
  type: z.enum(["credit", "debit"], { message: "Le type doit être 'credit' ou 'debit'" }),
  motif: z.string().min(1, "Le motif est obligatoire")
});

// ========== ACTIONS ==========

/**
 * Modifier les informations d'une entreprise (SuperAdmin)
 */
export const updateEntrepriseBySuperAdmin = async (formData: {
  entrepriseId: string;
  nomEntreprise?: string;
  emailEntreprise?: string;
  telephoneEntreprise?: string;
  adresse?: string;
  ninea?: string;
  rccm?: string;
  representéPar?: string;
  supportFees?: boolean;
  logo?: string;
}) => {
  try {
    const validation = UpdateEntrepriseBySuperAdminSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors
      };
    }

    const { entrepriseId, ...entrepriseData } = validation.data;

    // Nettoyer les champs vides
    const dataToSend = Object.fromEntries(
      Object.entries(entrepriseData).filter(([_, value]) => value !== "" && value !== undefined)
    );

    const response = await createdOrUpdated({
      url: `${SUPERADMIN_UPDATE_ENTREPRISE_URL}/${entrepriseId}`,
      data: dataToSend,
      updated: true
    });

    return {
      type: "success",
      message: "Entreprise mise à jour avec succès",
      data: response
    };

  } catch (error: any) {
    console.error("Erreur dans updateEntrepriseBySuperAdmin:", error);

    if (error.response?.status === 400) {
      return {
        type: "error",
        error: error.response.data.message || "Données invalides"
      };
    }

    if (error.response?.status === 404) {
      return {
        type: "error",
        error: "Entreprise non trouvée"
      };
    }

    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    return {
      type: "error",
      error: "Erreur lors de la mise à jour de l'entreprise"
    };
  }
};

/**
 * Ajuster le solde d'une entreprise (crédit ou débit)
 */
export const ajusterSoldeEntreprise = async (formData: {
  entrepriseId: string;
  montant: number;
  type: "credit" | "debit";
  motif: string;
}) => {
  try {
    const validation = AjusterSoldeSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors
      };
    }

    const { entrepriseId, ...soldeData } = validation.data;

    const response = await createdOrUpdated({
      url: `${SUPERADMIN_AJUSTER_SOLDE_URL}/${entrepriseId}`,
      data: soldeData,
      updated: false // POST request
    });

    return {
      type: "success",
      message: `Solde ${soldeData.type === 'credit' ? 'crédité' : 'débité'} avec succès`,
      data: response
    };

  } catch (error: any) {
    console.error("Erreur dans ajusterSoldeEntreprise:", error);

    if (error.response?.status === 400) {
      return {
        type: "error",
        error: error.response.data.message || "Solde insuffisant ou données invalides"
      };
    }

    if (error.response?.status === 404) {
      return {
        type: "error",
        error: "Entreprise non trouvée"
      };
    }

    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    return {
      type: "error",
      error: "Erreur lors de l'ajustement du solde"
    };
  }
};

/**
 * Récupérer l'historique des transactions d'une entreprise
 */
export const getTransactionsEntreprise = async (
  entrepriseId: string,
  options?: {
    page?: number;
    limit?: number;
    type?: "credit" | "debit";
    startDate?: string;
    endDate?: string;
  }
) => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.type) params.append("type", options.type);
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);

    const queryString = params.toString();
    const url = `${SUPERADMIN_TRANSACTIONS_URL}/${entrepriseId}${queryString ? `?${queryString}` : ''}`;

    const response = await fetchJSON(url);

    return {
      type: "success",
      data: response
    };

  } catch (error: any) {
    console.error("Erreur dans getTransactionsEntreprise:", error);

    return {
      type: "error",
      error: error.response?.data?.message || "Erreur lors de la récupération des transactions"
    };
  }
};

/**
 * Récupérer l'audit log d'une entreprise
 */
export const getAuditLogEntreprise = async (
  entrepriseId: string,
  options?: {
    page?: number;
    limit?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.action) params.append("action", options.action);
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);

    const queryString = params.toString();
    const url = `${SUPERADMIN_AUDIT_LOG_URL}/${entrepriseId}${queryString ? `?${queryString}` : ''}`;

    const response = await fetchJSON(url);

    return {
      type: "success",
      data: response
    };

  } catch (error: any) {
    console.error("Erreur dans getAuditLogEntreprise:", error);

    return {
      type: "error",
      error: error.response?.data?.message || "Erreur lors de la récupération de l'historique"
    };
  }
};

/**
 * Récupérer tous les audit logs (global)
 */
export const getAllAuditLogs = async (options?: {
  page?: number;
  limit?: number;
  action?: string;
  cibleType?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.action) params.append("action", options.action);
    if (options?.cibleType) params.append("cibleType", options.cibleType);
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);

    const queryString = params.toString();
    const url = `${SUPERADMIN_AUDIT_LOG_URL}${queryString ? `?${queryString}` : ''}`;

    const response = await fetchJSON(url);

    return {
      type: "success",
      data: response
    };

  } catch (error: any) {
    console.error("Erreur dans getAllAuditLogs:", error);

    return {
      type: "error",
      error: error.response?.data?.message || "Erreur lors de la récupération des audit logs"
    };
  }
};

/**
 * Récupérer les détails complets d'une entreprise avec transactions et audit logs récents
 */
export const getEntrepriseDetailsBySuperAdmin = async (entrepriseId: string) => {
  try {
    const url = `${SUPERADMIN_ENTREPRISE_DETAILS_URL}/${entrepriseId}/details`;
    const response = await fetchJSON(url);

    return {
      type: "success",
      data: response
    };

  } catch (error: any) {
    console.error("Erreur dans getEntrepriseDetailsBySuperAdmin:", error);

    return {
      type: "error",
      error: error.response?.data?.message || "Erreur lors de la récupération des détails"
    };
  }
};

/**
 * Récupérer les entreprises avec pagination côté serveur
 */
export const getEntreprisesPaginated = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
  sort?: string;
  order?: "asc" | "desc";
}) => {
  try {
    // Mapping des noms de tri frontend -> backend
    const sortMapping: Record<string, { field: string; order: "asc" | "desc" }> = {
      "name": { field: "nomEntreprise", order: "asc" },
      "name-desc": { field: "nomEntreprise", order: "desc" },
      "date": { field: "createdAt", order: "desc" },
      "date-asc": { field: "createdAt", order: "asc" },
      "solde": { field: "solde", order: "desc" },
      "solde-asc": { field: "solde", order: "asc" },
      "createdAt": { field: "createdAt", order: "desc" },
    };

    const sortConfig = options?.sort ? sortMapping[options.sort] : { field: "createdAt", order: "desc" };

    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.search) params.append("search", options.search);
    if (options?.status && options.status !== "all") params.append("status", options.status);
    if (sortConfig) {
      params.append("sort", sortConfig.field);
      params.append("order", options?.order || sortConfig.order);
    }

    const queryString = params.toString();
    const url = `${SUPERADMIN_ENTREPRISES_PAGINATED_URL}${queryString ? `?${queryString}` : ''}`;

    const response = await fetchJSON(url, { cache: 'no-store' });

    return {
      type: "success",
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };

  } catch (error: any) {
    console.error("Erreur dans getEntreprisesPaginated:", error);

    return {
      type: "error",
      error: error.response?.data?.message || "Erreur lors de la récupération des entreprises",
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
};

/**
 * Récupérer les candidatures avec pagination côté serveur
 */
export const getCandidaturesPaginated = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "pending" | "accepted" | "rejected";
  sort?: string;
  order?: "asc" | "desc";
}) => {
  try {
    // Mapping des noms de tri frontend -> backend
    const sortMapping: Record<string, { field: string; order: "asc" | "desc" }> = {
      "name": { field: "nomEntreprise", order: "asc" },
      "name-desc": { field: "nomEntreprise", order: "desc" },
      "date": { field: "createdAt", order: "desc" },
      "date-asc": { field: "createdAt", order: "asc" },
    };

    const sortConfig = options?.sort ? sortMapping[options.sort] : { field: "createdAt", order: "desc" };

    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.search) params.append("search", options.search);
    if (options?.status && options.status !== "all") params.append("status", options.status);
    if (sortConfig) {
      params.append("sort", sortConfig.field);
      params.append("order", options?.order || sortConfig.order);
    }

    const queryString = params.toString();
    const url = `${SUPERADMIN_CANDIDATURES_PAGINATED_URL}${queryString ? `?${queryString}` : ''}`;

    const response = await fetchJSON(url, { cache: 'no-store' });

    return {
      type: "success",
      data: response.data || [],
      counts: response.counts || {
        all: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
      },
      pagination: response.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };

  } catch (error: any) {
    console.error("Erreur dans getCandidaturesPaginated:", error);

    return {
      type: "error",
      error: error.response?.data?.message || "Erreur lors de la récupération des candidatures",
      data: [],
      counts: {
        all: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
};
