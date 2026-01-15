// routes.ts
export const LOGIN_REDIRECT_URL = "/auth/signin";

// Routes publiques
export const PublicRoute: (string | RegExp)[] = [
  "",
  "/",
  "/auth/register",
   "/auth/forgotPassword",
  "/auth/login",
  "/auth/new-password",
  "/auth/forgot-password",
  "/services",
  "/dashboard/Clients",
  "/clients",
  /^\/entreprise\/[^\/]+$/,
  /^\/services\/[^\/]+$/,
  "/page",
  /^\/dashboard\/[^\/]+$/,
];

// URLs de redirection pour chaque rôle
export const ROLE_REDIRECT_URLS: { [key: string]: string } = {
  admin: "dashboard/entreprise",  // Ajout du rôle admin
  gerant: "dashboard/clientsPage",
  superAdmin: "dashboard/entreprise/superAdmin/candidature",
};

// Définir les chemins accessibles pour chaque rôle
export const ROLEPAGES = {
  admin: [  // Ajout des routes pour admin
    "/dashboard/entreprise",
    "/page",
    "/dashboard/Gerants",
    "/dashboard/entreprise",
    "/dashboard/entreprise/samm",
    "/dashboard/Clients",
    "/dashboard/Affectation",
    "/dashboard/profile",
    "/dashboard/Agents",
    /^\/entreprise\/.*$/,
    /^\/dashboard\/profile\/[^/]+(\/updateProfile)?$/,
     /^\/dashboard\/entreprise\/[^/]+(\/updateEntreprise)?$/,
    /^\/dashboard\/profile\/[^/]+(\/changePassWord)?$/
  ],
  gerant: [
    "/dashboard/clientsPage", 
    "/dashboard/entreprise",
    "/dashboard/profile",

    /^\/dashboard\/profile\/[^/]+(\/updateProfile)?$/,
     /^\/dashboard\/profile\/[^/]+(\/updateEntreprise)?$/,
    /^\/dashboard\/profile\/[^/]+(\/changePassWord)?$/
  ],
  superAdmin: [
    "/dashboard/entreprise/superAdmin/candidature",
    "/dashboard/entreprise/superAdmin/historique",
    "/dashboard/entreprise/superAdmin/partenaire",
    "/dashboard/entreprise/superAdmin/messages",
    "/dashboard/profile",
    /^\/dashboard\/profile\/[^/]+(\/updateProfile)?$/,
    /^\/dashboard\/profile\/[^/]+(\/changePassWord)?$/
  ]
};

// Fonction pour obtenir l'URL en fonction du rôle
export function getRedirectUrlForRole(role: string): string | null {
  const url = ROLE_REDIRECT_URLS[role];
  return url ? `/${url}` : null;
}