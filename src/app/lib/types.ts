export type RequestData = {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    telephone: string;
    nomEntreprise: string;
    ninea: string;
    dateCreation: string;
    rccm: string;
    representéPar: string;
    adresse: string;
    telephoneEntreprise?: string; // Optionnel, si nécessaire
    emailEntreprise?: string; // Optionnel, si nécessaire
  };

  export type FormDataRegister = {
    nom: string;           // Correspond à lastName
    prenom: string;        // Correspond à firstName
    email: string;         // Reste identique
    password: string;      // Reste identique
    telephone: string;     // Correspond à phone
    nomEntreprise: string; // Correspond à companyName
    ninea: string;         // Nouveau champ spécifique
    dateCreation: string;  // Nouveau champ spécifique
    rccm: string;         // Nouveau champ spécifique     // Nouveau champ spécifique
    representéPar: string; // Nouveau champ spécifique
};

// types/client.types.ts

export interface NiveauService {
  nom: string;
  tarif: number;
  _id?: string;
}

export interface Service {
  _id: string;
  nomService: string;
  niveauxDisponibles?: NiveauService[];
  entrepriseId?: string;
}

export interface Expediteur {
  id: string;
  nom: string;
  prenom: string;
}

export interface Entreprise {
  id: string;
}

export interface Paiement {
  _id: string;
  paiementId?: string;
  frais:string;
  montant: number;
  datePaiement: string;
    dateReglement?: string | Date | null;
  statut: string;
  token:string;
  expediteur?: Expediteur;
  entreprise?: Entreprise;
}

export interface UserInfos {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  imgUser?: string;
  adresse?: string;
  nin?: string;
}

export interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  nin?: string;
  estNouveau: boolean;
  dateCreation?: string;
  entrepriseId?: string;
  servicesChoisis?: Service[];
  paiementsEffectues?: Paiement[];
  references?: any[];
  // Nouveaux champs
  aDejaPaye?: boolean;
  aFAirePayer?: boolean;
  dateProgrammee?: string | Date | null;
  frequencePaiement?: string;
  intervallePaiement?: number;
  jourPaiement?: number;
  lienDejaEnvoye?: boolean;
  montantTotal?: number;
  niveauServicesChoisis?: string[];
  dateReglement?: string | Date | null;
}

export type OperationType = 'update' | 'delete' | 'removeFromService' | 'addService';

export interface ClientDialogProps {
  client: Client | null;
  entrepriseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedClient: any) => Promise<any>;
  onDelete?: (formData: any) => Promise<any>;
  onRemoveFromService?: (formData: any) => Promise<any>;
  onAddService?: (formData: any) => Promise<any>;
  verifyOtp: (formData: any) => Promise<any>;
  services?: Service[];
}

export interface ClientTabProps {
  client: Client;
  isEditing?: boolean;
  formData?: Partial<Client>;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}


// types/agent.types.ts

export interface NiveauService {
  nom: string;
  tarif: number;
  _id?: string;
}

export interface Service {
  _id: string;
  nomService: string;
  niveauxDisponibles?: NiveauService[];
  entrepriseId?: string;
}

export interface Expediteur {
  id: string;
  nom: string;
  prenom: string;
}

export interface Entreprise {
  id: string;
}

export interface Paiement {
  _id: string;
  paiementId?: string;
  montant: number;
  dateReglement?: string | Date | null;
  datePaiement: string;
  statut: string;
  expediteur?: Expediteur;
  entreprise?: Entreprise;
}

export interface VirementRecu {
  _id: string;
  datePaiement?: string;
  montant?: number;
  paiementId?: string;
  statut?: string;
  expediteur?: Expediteur;
  entreprise?: Entreprise;
}

// Dans votre fichier de types, modifiez l'interface Agent :

export interface Agent {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  nin?: string;
  dateProchainVirement?: string | Date | null;
  estNouveau: boolean;
  
  // Nouveaux champs pour les paiements
  salaire?: number;
  frequencePaiement?: 'mensuel' | 'hebdomadaire' | 'quotidien' | 'horaire' | 'minute' | 'unique';
  intervallePaiement?: number;
  jourPaiement?: number;
  wallet?: string;
  aPayer?: boolean;
  
  dateCreation?: string;
  entrepriseId?: string;
  servicesAffecte?: Service[];
  paiementsEffectues?: Paiement[];
  virementsRecus?: VirementRecu[];
}


export interface AgentDialogProps {
  agent: Agent | null;
  entrepriseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAgent: any) => Promise<any>;
  onDelete?: (formData: any) => Promise<any>;
  onRemoveFromService?: (formData: any) => Promise<any>;
  onAddService?: (formData: any) => Promise<any>;
  verifyOtp: (formData: any) => Promise<any>;
  services?: Service[];
}

// types/createClient.types.ts

export interface NiveauService {
  nom: string;
  tarif: number;
  _id?: string;
}

export interface Service {
  _id: string;
  nomService: string;
  niveauxDisponibles: NiveauService[];
  entrepriseId?: string;
}

export interface CreateClientModalProps {
  services?: Service[];
  entrepriseId?: string;
}

export interface ValidationErrors {
  [key: string]: string[];
}

export interface ClientFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  nin: string;
  serviceId: string;
  nomService: string;
  entrepriseId: string;
  niveauService: string;
  // Champs de paiement
  salaire: string;
  frequencePaiement: string;
  intervallePaiement: number;
  jourPaiement: number;
  aPayer: boolean;
  dateProgrammee: string;
}