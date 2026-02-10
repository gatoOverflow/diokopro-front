export type User = {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    enterpriseId?: string;
    entrepriseId?: string; // Variante possible
    entreprise?: string | { _id: string };
  };