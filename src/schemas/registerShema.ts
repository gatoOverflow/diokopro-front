import { z } from "zod";

export const RegisterSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  telephone: z.string().min(1, "Le numéro de téléphone est requis"),
  nomEntreprise: z.string().min(1, "Le nom de l'entreprise est requis"),
  // Informations d'entreprise renseignees plus tard dans les parametres :
  // l'inscription ne demande plus que le nom.
  ninea: z.string().optional(),
  dateCreation: z.string().optional(),
  rccm: z.string().optional(),
  representéPar: z.string().optional(),
  adresse: z.string().optional(),
  emailEntreprise: z.string().email("Format d'email invalide pour l'entreprise").optional().or(z.literal("")),
  telephoneEntreprise: z.string().optional(),
//teste 45
});