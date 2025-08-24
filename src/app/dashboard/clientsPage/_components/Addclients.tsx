"use client";
import React, { useState, useEffect } from "react";
import { CircleX, Mail, Home, Plus, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/actions/clientreq";
import PhoneInput from "./phone";
import { validateOTP } from "@/actions/service";
import { Button } from "@/components/ui/button";
import OtpInput from "../../entreprise/_components/_Agent/OtpInput";
import { useRouter } from "next/navigation"; // Ajout pour Next.js

interface NiveauService {
  nom: string;
  tarif: number;
  _id?: string;
}

interface Service {
  _id: string;
  nomService: string;
  niveauxDisponibles: NiveauService[];
  entrepriseId?: string;
}

interface CreateClientModalProps {
  services?: Service[];
  entrepriseId?: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

const CreateClientModal = ({ services = [], entrepriseId = "" }: CreateClientModalProps) => {
  const router = useRouter(); // Hook pour Next.js
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedServiceNiveaux, setSelectedServiceNiveaux] = useState<NiveauService[]>([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    nin: "",
    serviceId: "",
    nomService: "",
    entrepriseId: entrepriseId,
    niveauService: "",
    // Nouveaux champs pour les paiements
    salaire: "",
    frequencePaiement: "mensuel",
    intervallePaiement: 1,
    jourPaiement: 1,
    aFAirePayer: false,
    // Champ pour la date programmée
    dateProgrammee: ""
  });
  
  // États pour la vérification OTP
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingChangeId, setPendingChangeId] = useState("");

  // Log pour déboguer l'état des services
  useEffect(() => {
    // Vérifier si un service existe mais que l'entrepriseId est manquante
    const servicesMissingEntrepriseId = services.filter(service => !service.entrepriseId);
    if (servicesMissingEntrepriseId.length > 0) {
      console.warn("Services sans entrepriseId:", servicesMissingEntrepriseId);
    }
    
    // Si formData n'a pas d'entrepriseId, essayez d'en définir une par défaut
    if (!formData.entrepriseId && services.length > 0) {
      const defaultEntrepriseId = getDefaultEntrepriseId();
      if (defaultEntrepriseId) {
        setFormData(prev => ({
          ...prev,
          entrepriseId: defaultEntrepriseId
        }));
      }
    }
  }, [services, formData.entrepriseId]);

  // Fonction pour actualiser la page
  const refreshPage = () => {
    // Option 1: Utiliser router.refresh() pour Next.js (recommandé)
    if (router) {
      router.refresh();
    } else {
      // Option 2: Actualisation complète de la page (fallback)
      window.location.reload();
    }
  };

  // Récupérer l'entrepriseId du premier service disponible (solution de secours)
  const getDefaultEntrepriseId = () => {
    if (services && services.length > 0) {
      // Trouver le premier service avec un entrepriseId
      const serviceWithEntreprise = services.find(service => service.entrepriseId);
      if (serviceWithEntreprise) {
        return serviceWithEntreprise.entrepriseId;
      }
    }
    // Si aucun service n'a d'entrepriseId, retourner une valeur par défaut
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "salaire" || name === "intervallePaiement" || name === "jourPaiement" 
        ? (value === '' ? '' : Number(value))
        : value 
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked 
    }));
  };

  const openModal = () => {
    setIsOpen(true);
    setErrors({});
  };

  const closeModal = () => {
    resetModal();
  };

  const resetModal = () => {
    setIsOpen(false);
    setShowOtpVerification(false);
    setOtpCode("");
    setPendingChangeId("");
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
      nin: "",
      serviceId: "",
      nomService: "",
      entrepriseId: entrepriseId,
      niveauService: "",
      // Réinitialiser les champs de paiement
      salaire: "",
      frequencePaiement: "mensuel",
      intervallePaiement: 1,
      jourPaiement: 1,
      aFAirePayer: false,
      // Réinitialiser la date programmée
      dateProgrammee: ""
    });
    setSelectedServiceNiveaux([]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let hasErrors = false;

    // Validation des champs obligatoires
    const requiredFields = [
      { field: 'serviceId', message: 'Le service est requis' },
      { field: 'niveauService', message: 'Le niveau de service est requis' },
      { field: 'nom', message: 'Le nom est requis' },
      { field: 'prenom', message: 'Le prénom est requis' },
      { field: 'email', message: 'L\'email est requis' },
      { field: 'telephone', message: 'Le téléphone est requis' },
      { field: 'adresse', message: 'L\'adresse est requise' }
    ];

    requiredFields.forEach(({ field, message }) => {
      const value = formData[field as keyof typeof formData];
      if (!value || String(value).trim() === "") {
        newErrors[field] = [message];
        hasErrors = true;
      }
    });

    // Validation format email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = ["Format d'email invalide"];
      hasErrors = true;
    }

    // Validation spécifique selon la fréquence de paiement
    switch (formData.frequencePaiement) {
      case 'mensuel':
        if (formData.jourPaiement < 1 || formData.jourPaiement > 31) {
          newErrors.jourPaiement = ["Le jour du mois doit être entre 1 et 31"];
          hasErrors = true;
        }
        break;
      case 'hebdomadaire':
        if (formData.jourPaiement < 0 || formData.jourPaiement > 6) {
          newErrors.jourPaiement = ["Le jour de la semaine doit être entre 0 (dimanche) et 6 (samedi)"];
          hasErrors = true;
        }
        break;
      case 'horaire':
        if (formData.intervallePaiement < 1 || formData.intervallePaiement > 24) {
          newErrors.intervallePaiement = ["L'intervalle doit être entre 1 et 24 heures"];
          hasErrors = true;
        }
        break;
      case 'minute':
        if (formData.intervallePaiement < 1 || formData.intervallePaiement > 60) {
          newErrors.intervallePaiement = ["L'intervalle doit être entre 1 et 60 minutes"];
          hasErrors = true;
        }
        break;
    }

    if (hasErrors) {
      setErrors(newErrors);
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setErrors({});

    if (!validateForm()) return;

    // Vérifier entrepriseId avant soumission
    let finalFormData = { ...formData };
    
    if (!finalFormData.entrepriseId && finalFormData.serviceId) {
      const defaultEntrepriseId = getDefaultEntrepriseId();
      
      if (defaultEntrepriseId) {
        finalFormData = {
          ...finalFormData,
          entrepriseId: defaultEntrepriseId
        };
        setFormData(finalFormData);
      } else {
        console.error("Aucune entrepriseId par défaut disponible");
        toast.error("Erreur de sélection du service. Veuillez réessayer ou contacter l'administrateur.");
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const response = await createClient(finalFormData);

      if (response.success || response.type === "success") {
        if (response.data?.pendingChangeId || response.pendingChangeId) {
          toast.success("Demande de création envoyée ! Veuillez entrer le code OTP.");
          setPendingChangeId(response.data?.pendingChangeId || response.pendingChangeId);
          setShowOtpVerification(true);
        } else {
          toast.success("Client créé avec succès !");
          resetModal();
          // ✅ Actualiser la page après création réussie
          setTimeout(() => {
            refreshPage();
          }, 500); // Petit délai pour laisser le toast s'afficher
        }
      } else {
        // Gestion des erreurs
        if (response.errors) {
          setErrors(response.errors);
          const firstError = Object.values(response.errors)[0]?.[0];
          if (firstError) {
            toast.error(firstError);
          }
        } else {
          const errorMessage = response.error || response.message || "Une erreur est survenue";
          toast.error(errorMessage);
          setErrors({ global: [errorMessage] });
        }
      }
    } catch (error: any) {
      console.error("Erreur complète:", error);
      const errorMessage = error.message || "Une erreur inattendue est survenue";
      toast.error(errorMessage);
      setErrors({ global: [errorMessage] });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    if (!formData.entrepriseId) {
      toast.error("Entreprise non sélectionnée");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await validateOTP(pendingChangeId, otpCode, formData.entrepriseId);
      
      if (response.success) {
        toast.success("Client validé avec succès !");
        resetModal();
        // ✅ Actualiser la page après validation OTP réussie
        setTimeout(() => {
          refreshPage();
        }, 500); // Petit délai pour laisser le toast s'afficher
      } else {
        toast.error(response.error || "Code OTP invalide ou expiré");
        
        if (response.errors) {
          Object.values(response.errors).forEach((errorArray: any) => {
            if (Array.isArray(errorArray)) {
              errorArray.forEach((error: string) => {
                toast.error(error);
              });
            }
          });
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la validation OTP:", error);
      toast.error(error.message || "Échec de la vérification du code OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    await verifyOtp();
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedService = services.find((service) => service._id === selectedId);
  
    if (selectedService) {
      // Utilisez l'entrepriseId du service s'il existe, sinon utilisez celui passé en prop
      const serviceEntrepriseId = selectedService.entrepriseId || entrepriseId;
      
      if (!serviceEntrepriseId) {
        console.warn("Attention: Aucun entrepriseId disponible");
        toast.warning("Impossible de déterminer l'entreprise. Veuillez sélectionner un autre service.");
        return;
      }
      
      // Mettre à jour les niveaux disponibles pour ce service
      setSelectedServiceNiveaux(selectedService.niveauxDisponibles || []);
      
      // Réinitialiser le niveau de service sélectionné
      setFormData(prev => ({
        ...prev,
        serviceId: selectedService._id,
        nomService: selectedService.nomService,
        entrepriseId: serviceEntrepriseId,
        niveauService: "", // Réinitialiser à vide lors du changement de service
      }));
      
      // Effacer les erreurs des champs service et niveau
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.serviceId;
        delete newErrors.niveauService;
        return newErrors;
      });
    } else {
      // Réinitialiser le service et les niveaux
      setFormData(prev => ({
        ...prev,
        serviceId: "",
        nomService: "",
        niveauService: "",
      }));
      setSelectedServiceNiveaux([]);
    }
  };

  // Fonction helper pour afficher les erreurs d'un champ
  const getFieldError = (fieldName: string) => {
    return errors[fieldName] && errors[fieldName].length > 0 ? (
      <span className="text-red-500 text-sm mt-1 block">{errors[fieldName][0]}</span>
    ) : null;
  };

  // Fonction pour ajuster les champs à afficher en fonction de la fréquence de paiement
  const renderFrequencyFields = () => {
    switch (formData.frequencePaiement) {
      case 'mensuel':
        return (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Jour du mois</label>
            <input
              type="number"
              name="jourPaiement"
              value={formData.jourPaiement}
              onChange={handleChange}
              min="1"
              max="31"
              className={`border ${errors.jourPaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {getFieldError('jourPaiement')}
            <span className="text-xs text-gray-500 mt-1 block">Jour du mois (1-31) où le paiement sera effectué</span>
          </div>
        );
      /* case 'hebdomadaire':
        return (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Jour de la semaine</label>
            <select
              name="jourPaiement"
              value={formData.jourPaiement}
              onChange={handleChange}
              className={`border ${errors.jourPaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="0">Dimanche</option>
              <option value="1">Lundi</option>
              <option value="2">Mardi</option>
              <option value="3">Mercredi</option>
              <option value="4">Jeudi</option>
              <option value="5">Vendredi</option>
              <option value="6">Samedi</option>
            </select>
            {getFieldError('jourPaiement')}
          </div>
        ); */
      case 'horaire':
        return (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Intervalle (heures)</label>
            <input
              type="number"
              name="intervallePaiement"
              value={formData.intervallePaiement}
              onChange={handleChange}
              min="1"
              max="24"
              className={`border ${errors.intervallePaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {getFieldError('intervallePaiement')}
            <span className="text-xs text-gray-500 mt-1 block">Nombre d'heures entre chaque paiement (1-24)</span>
          </div>
        );
        case 'journalier':
        return (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Intervalle (jours)</label>
            <input
              type="number"
              name="intervallePaiement"
              value={formData.intervallePaiement}
              onChange={handleChange}
              
     
              className={`border ${errors.intervallePaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {getFieldError('intervallePaiement')}
            <span className="text-xs text-gray-500 mt-1 block">Nombre de jour entre chaque paiement </span>
          </div>
        );
      case 'minute':
        return (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Intervalle (minutes)</label>
            <input
              type="number"
              name="intervallePaiement"
              value={formData.intervallePaiement}
              onChange={handleChange}
              min="1"
              max="60"
              className={`border ${errors.intervallePaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {getFieldError('intervallePaiement')}
            <span className="text-xs text-gray-500 mt-1 block">Nombre de minutes entre chaque paiement (1-60)</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Cercle avec bordure orange et icône plus */}
      <button
        onClick={openModal}
        className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-orange-400 hover:border-orange-500 transition-colors duration-200 focus:outline-none"
        aria-label="Ajouter un client"
        type="button"
      >
        <Plus className="w-6 h-6 text-orange-500" strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-6">
                {showOtpVerification ? "Vérification du client" : "Ajouter un nouveau client"}
              </h2>
              <Button
                onClick={closeModal}
                className="text-gray-600 focus:outline-none"
                type="button"
              >
                <CircleX className="w-6 h-6" />
              </Button>
            </div>

            {errors.global && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errors.global[0]}
              </div>
            )}

            {!showOtpVerification ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Service <span className="text-red-500">*</span></label>
                  <select
                    className={`w-full border ${errors.serviceId ? 'border-red-500' : 'border-gray-300'
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.serviceId}
                    onChange={handleServiceChange}
                    required
                    name="serviceId"
                  >
                    <option value="">Sélectionnez un service</option>
                    {Array.isArray(services) && services.length > 0 ? (
                      services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.nomService}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Aucun service disponible</option>
                    )}
                  </select>
                  {errors.serviceId?.length > 0 ? (
                    <span className="text-red-500 text-sm mt-1">{errors.serviceId[0]}</span>
                  ) : (
                    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                  )}
                </div>

                {/* Sélection du niveau de service */}
                {formData.serviceId && selectedServiceNiveaux.length > 0 && (
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Niveau de service <span className="text-red-500">*</span></label>
                    <select
                      className={`w-full border ${errors.niveauService ? 'border-red-500' : 'border-gray-300'
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      value={formData.niveauService}
                      onChange={handleChange}
                      name="niveauService"
                      required
                    >
                      <option value="">Sélectionnez un niveau</option>
                      {selectedServiceNiveaux.map((niveau, index) => (
                        <option key={niveau._id || index} value={niveau.nom}>
                          {niveau.nom} - {niveau.tarif} FCFA
                        </option>
                      ))}
                    </select>
                    {errors.niveauService?.length > 0 ? (
                      <span className="text-red-500 text-sm mt-1">{errors.niveauService[0]}</span>
                    ) : (
                      <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Ex: Dupont"
                      className={`border ${errors.nom ? 'border-red-500' : 'border-gray-300'
                        } rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    />
                    {errors.nom?.length > 0 ? (
                      <span className="text-red-500 text-sm mt-1">{errors.nom[0]}</span>
                    ) : (
                      <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Ex: Jean"
                      className={`border ${errors.prenom ? 'border-red-500' : 'border-gray-300'
                        } rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    />
                    {errors.prenom?.length > 0 ? (
                      <span className="text-red-500 text-sm mt-1">{errors.prenom[0]}</span>
                    ) : (
                      <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                  <div className={`flex items-center border ${errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent`}>
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemple@domaine.com"
                      className="flex-1 outline-none"
                      required
                    />
                  </div>
                  {errors.email?.length > 0 ? (
                    <span className="text-red-500 text-sm mt-1">{errors.email[0]}</span>
                  ) : (
                    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                  <PhoneInput
                    value={formData.telephone}
                    onChange={(_, fullNumber) => {
                      setFormData(prev => ({ ...prev, telephone: fullNumber }));
                      if (errors.telephone) {
                        setErrors(prev => ({ ...prev, telephone: [] }));
                      }
                    }}
                    error={errors.telephone?.[0]}
                    required
                  />
                  {!errors.telephone?.length && (
                    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Adresse <span className="text-red-500">*</span></label>
                  <div className={`flex items-center border ${errors.adresse ? 'border-red-500' : 'border-gray-300'
                    } rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent`}>
                    <Home className="w-4 h-4 mr-2 text-gray-500" />
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Votre adresse complète"
                      className="flex-1 outline-none"
                      required
                    />
                  </div>
                  {errors.adresse?.length > 0 ? (
                    <span className="text-red-500 text-sm mt-1">{errors.adresse[0]}</span>
                  ) : (
                    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">NIN (optionnel)</label>
                  <input
                    type="text"
                    name="nin"
                    value={formData.nin}
                    onChange={handleChange}
                    placeholder="Numéro d'identification national"
                    className={`w-full border ${errors.nin ? 'border-red-500' : 'border-gray-300'
                      } rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {getFieldError('nin')}
                </div>

                {/* Section des paramètres de paiement */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-orange-500" />
                    Paramètres de paiement
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Fréquence de paiement</label>
                      <select
                        name="frequencePaiement"
                        value={formData.frequencePaiement}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mensuel">Mensuel</option>
                        <option value="hebdomadaire">Hebdomadaire</option>
                        <option value="journalier">Journalier</option>
                        <option value="horaire">Horaire</option>
                        <option value="minute">Minute</option>
                        <option value="unique">Paiement unique</option>
                      </select>
                      {getFieldError('frequencePaiement')}
                    </div>
                    
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Date programmée</label>
                      <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <input
                          type="datetime-local"
                          name="dateProgrammee"
                          value={formData.dateProgrammee}
                          onChange={handleChange}
                          className="flex-1 outline-none"
                        />
                      </div>
                      {getFieldError('dateProgrammee')}
                      <span className="text-xs text-gray-500 mt-1 block">Date et heure prévues (optionnel)</span>
                    </div>
                  </div>

                  {/* Champs conditionnels basés sur la fréquence de paiement */}
                  {renderFrequencyFields()}

                  {/* Checkbox aPayer corrigé avec indicateur visuel - LOGIQUE INVERSÉE POUR LES CLIENTS */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="aFAirePayer"
                        checked={formData.aFAirePayer}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex flex-col">
                        <span className={`font-medium ${formData.aFAirePayer ? 'text-green-600' : 'text-red-600'}`}>
                          {formData.aFAirePayer ? '✅ Client vas payer' : '❌Client ne vas payé'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formData.aFAirePayer 
                            ? 'Ce client recevra des paiements automatiques selon la fréquence définie'
                            : 'Ce client ne recevra pas de paiements automatiques  '
                          }
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#ee7606] hover:bg-[#d56a05] text-white rounded-md disabled:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    type="button"
                  >
                    {isLoading ? "Chargement..." : "Ajouter"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <OtpInput
                  length={6}
                  onComplete={(code) => {
                    setOtpCode(code);
                  }}
                  onSubmit={handleOtpVerification}
                  disabled={isLoading}
                  isLoading={isLoading}
                  title="Vérification OTP - Création du client"
                  description="Un code OTP a été envoyé pour confirmer la création du client. Veuillez saisir le code à 6 chiffres reçu par l'administrateur."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateClientModal;