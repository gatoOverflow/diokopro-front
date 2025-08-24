"use client";
import React, { useState, useEffect } from "react";
import { CircleX, Mail, Home, Plus, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createAgent } from "@/actions/Agent";
import { validateOTP } from "@/actions/service";
import PhoneInput from "../../clientsPage/_components/phone";
import OtpInput from "../../entreprise/_components/_Agent/OtpInput";
import { Button } from "@/components/ui/button";

import * as Select from "@radix-ui/react-select";
interface Service {
  _id: string;
  nomService: string;
  entrepriseId: string;
}

interface CreateAgentModalProps {
  services?: Service[];
  entrepriseId?: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

const CreateAgentModal = ({ services = [], entrepriseId = "" }: CreateAgentModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
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
    // Nouveaux champs pour les paiements
    salaire: "",
    frequencePaiement: "mensuel",
    intervallePaiement: 1,
    jourPaiement: 1,
    wallet: "",
    aPayer: false, // ✅ Initialisé à false par défaut
    dateProchainVirement: ""
  });

  // Log pour déboguer l'état des services
  useEffect(() => {
    //console.log("Services disponibles:", services);

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
        //console.log("EntrepriseId par défaut défini:", defaultEntrepriseId);
      }
    }
  }, [services]);

  // États pour la vérification OTP
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingChangeId, setPendingChangeId] = useState("");

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
        ? Number(value)
        : value
    }));
    // Effacer l'erreur du champ modifié
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleWalletChange = (value) => {
    setFormData(prev => ({ ...prev, wallet: value }));
    setErrors(prev => ({ ...prev, wallet: [] }));
  };

  // ✅ Fonction corrigée pour gérer le checkbox aPayer
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    //console.log(`Checkbox ${name} changé:`, checked); // Debug
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
      salaire: "",
      wallet: "", 
      frequencePaiement: "mensuel",
      intervallePaiement: 1,
      jourPaiement: 1,
      aPayer: false, // ✅ Réinitialisé à false
      dateProchainVirement: ""
    });
    setErrors({});
  };

  const walletOptions = [ 
    { value: 'orange-money-senegal', label: 'Orange Money Sénégal' }, 
    { value: 'free-money-senegal', label: 'Free Money Sénégal' }, 
    { value: 'wave-senegal', label: 'Wave Sénégal' }, 
  ]

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: ValidationErrors = {};
    let hasErrors = false;

    // Debug: Afficher l'état d'aPayer avant soumission
    //console.log("État aPayer lors de la soumission:", formData.aPayer);

    // Vérification de chaque champ obligatoire
    if (!formData.serviceId) {
      newErrors.serviceId = ["Le service est requis"];
      hasErrors = true;
    }

    if (!formData.nom || formData.nom.trim() === "") {
      newErrors.nom = ["Le nom est requis"];
      hasErrors = true;
    }

    if (!formData.prenom || formData.prenom.trim() === "") {
      newErrors.prenom = ["Le prénom est requis"];
      hasErrors = true;
    }

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = ["L'email est requis"];
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = ["Format d'email invalide"];
      hasErrors = true;
    }

    if (!formData.telephone || formData.telephone.trim() === "") {
      newErrors.telephone = ["Le téléphone est requis"];
      hasErrors = true;
    }

    if (!formData.adresse || formData.adresse.trim() === "") {
      newErrors.adresse = ["L'adresse est requise"];
      hasErrors = true;
    }

    if (!formData.wallet || formData.wallet.trim() === "") {
      newErrors.wallet = ["Le portefeuille est requis"];
      hasErrors = true;
    }

    // Validation spécifique à la fréquence
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

    // Si entrepriseId est vide et qu'un service est sélectionné, essayer d'utiliser une valeur par défaut
    if (!formData.entrepriseId && formData.serviceId) {
      //console.log("Service sélectionné mais entrepriseId manquant, tentative d'utiliser l'entrepriseId par défaut");
      const defaultEntrepriseId = getDefaultEntrepriseId();

      if (defaultEntrepriseId) {
        // Mettre à jour le formData avec l'entrepriseId par défaut
        setFormData(prev => ({
          ...prev,
          entrepriseId: defaultEntrepriseId
        }));

        //console.log("EntrepriseId par défaut utilisée:", defaultEntrepriseId);
      } else {
        console.error("Aucune entrepriseId par défaut disponible");
        toast.error("Erreur de sélection du service. Veuillez réessayer ou contacter l'administrateur.");
        return;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createAgent(formData);
      //console.log("Réponse reçue:", response);

      if (response.type === "success" && response.data?.pendingChangeId) {
        // Cas où l'agent a été créé mais nécessite une validation OTP
        toast.success("Demande de création envoyée ! Veuillez entrer le code OTP envoyé à l'administrateur");
        setPendingChangeId(response.data.pendingChangeId);
        setShowOtpVerification(true);
        //console.log("OTP Verification activée, pendingChangeId:", response.data.pendingChangeId);
      } else if (response.message && response.pendingChangeId) {
        // Format de réponse alternatif du middleware requireOTPValidation
        toast.success("Demande de création envoyée ! Veuillez entrer le code OTP envoyé à l'administrateur");
        setPendingChangeId(response.pendingChangeId);
        setShowOtpVerification(true);
        //console.log("OTP Verification activée, pendingChangeId:", response.pendingChangeId);
      } else if (response.type === "success") {
        // Cas où l'agent a été créé sans besoin de validation OTP
        toast.success("Agent créé avec succès !");
        resetModal();
      } else if (response.errors) {
        // Gestion structurée des erreurs du backend
        setErrors(response.errors);
        // Afficher la première erreur en toast
        const firstError = Object.values(response.errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
        }
      } else {
        toast.error(response.error || "Une erreur est survenue");
        setErrors({ global: [response.error || "Une erreur est survenue"] });
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
    if (!otpCode || otpCode.length < 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    if (!formData.entrepriseId) {
      toast.error("Entreprise non sélectionnée");
      return;
    }

    setIsLoading(true);
    try {
      //console.log("Validation OTP:", { pendingChangeId, otpCode, entrepriseId: formData.entrepriseId });
      // Vérification OTP avec le pendingChangeId et l'entrepriseId
      const response = await validateOTP(pendingChangeId, otpCode, formData.entrepriseId);
      //console.log("Réponse API validation OTP:", response);

      if (response.success) {
        toast.success("Agent validé avec succès !");
        resetModal();
      } else {
        toast.error(response.error || "Code OTP invalide ou expiré");

        // Si des erreurs de validation sont présentes, les afficher
        if (response.errors) {
          Object.values(response.errors).forEach((errorArray: any) => {
            errorArray.forEach((error: string) => {
              toast.error(error);
            });
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la validation OTP:", error);
      toast.error("Échec de la vérification du code OTP");
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
      //console.log("Service sélectionné:", selectedService);

      // Utilisez l'entrepriseId du service s'il existe, sinon utilisez celui passé en prop
      const serviceEntrepriseId = selectedService.entrepriseId || entrepriseId;

      if (!serviceEntrepriseId) {
        console.warn("Attention: Aucun entrepriseId disponible");
        toast.warning("Impossible de déterminer l'entreprise. Veuillez sélectionner un autre service.");
        return;
      }

      setFormData({
        ...formData,
        serviceId: selectedService._id,
        nomService: selectedService.nomService,
        entrepriseId: serviceEntrepriseId,
      });

      setErrors((prev) => ({ ...prev, serviceId: [] }));
    } else {
      // Garder l'entrepriseId existant même si le service est réinitialisé
      setFormData({
        ...formData,
        serviceId: "",
        nomService: "",
        // Nous ne réinitialisons pas entrepriseId ici pour le conserver
      });
    }
  };

  // Fonction helper pour afficher les erreurs d'un champ
  const getFieldError = (fieldName: string) => {
    return errors[fieldName]?.length > 0 ? (
      <span className="text-red-500 text-sm mt-1">{errors[fieldName][0]}</span>
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
              className={`border ${errors.jourPaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
            />
            {getFieldError('jourPaiement')}
            <span className="text-xs text-gray-500 mt-1">Jour du mois (1-31) où le paiement sera effectué</span>
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
              className={`border ${errors.jourPaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
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
              className={`border ${errors.intervallePaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
            />
            {getFieldError('intervallePaiement')}
            <span className="text-xs text-gray-500 mt-1">Nombre d'heures entre chaque paiement (1-24)</span>
          </div>
        );
         case 'journalier':
        return (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Intervalle (Jours)</label>
            <input
              type="number"
              name="intervallePaiement"
              value={formData.intervallePaiement}
              onChange={handleChange}
              
              className={`border ${errors.intervallePaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
            />
            {getFieldError('intervallePaiement')}
            <span className="text-xs text-gray-500 mt-1">Nombre de jour entre chaque paiement </span>
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
              className={`border ${errors.intervallePaiement ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
            />
            {getFieldError('intervallePaiement')}
            <span className="text-xs text-gray-500 mt-1">Nombre de minutes entre chaque paiement (1-60)</span>
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
        aria-label="Ajouter un agent"
        type="button"
      >
        <Plus className="w-6 h-6 text-orange-500" strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-6">
                {showOtpVerification ? "Vérification de l'agent" : "Ajouter un nouvel agent"}
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
                 <div>
  <label className="block mb-1 font-medium text-gray-700">
    Portefeuille mobile <span className="text-red-500">*</span>
  </label>
  <Select.Root value={formData.wallet} onValueChange={handleWalletChange}>
    <Select.Trigger className={`w-full border ${errors.wallet ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between`}>
      <Select.Value placeholder="Sélectionnez un portefeuille" />
      <Select.Icon className="ml-2">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61933 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor"/>
        </svg>
      </Select.Icon>
    </Select.Trigger>
    
    <Select.Portal>
      <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-50">
        <Select.Viewport className="p-1">
          {walletOptions.map((option) => (
            <Select.Item 
              key={option.value} 
              value={option.value}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-sm outline-none data-[highlighted]:bg-gray-100"
            >
              <Select.ItemText>{option.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
  
  {errors.wallet?.length > 0 ? (
    <span className="text-red-500 text-sm mt-1">{errors.wallet[0]}</span>
  ) : (
    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
  )}
</div>

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
                        } rounded-md p-2 w-full`}
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
                        } rounded-md p-2 w-full`}
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
                    } rounded-md p-2`}>
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
                <label className="block mb-1 font-medium text-gray-700">Salaire <span className="text-red-500">*</span></label>
                <div className={`flex items-center border ${errors.salaire ? 'border-red-500' : 'border-gray-300'
                  } rounded-md p-2`}>

                  <input
                    type="number"
                    name="salaire"
                    value={formData.salaire}
                    onChange={handleChange}
                    placeholder="Montant du salaire"
                    className="flex-1 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                  <PhoneInput
                    value={formData.telephone}
                    onChange={(_, fullNumber) => {
                      setFormData(prev => ({ ...prev, telephone: fullNumber }));
                      setErrors(prev => ({ ...prev, telephone: [] }));
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
                    } rounded-md p-2`}>
                    <Home className="w-4 h-4 mr-2 text-gray-500" />
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Adresse complète"
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
                      } rounded-md p-2`}
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
                        className="border border-gray-300 rounded-md p-2 w-full"
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
                      <label className="block mb-1 font-medium text-gray-700">Date Prochain virement</label>
                      <div className="flex items-center border border-gray-300 rounded-md p-2">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <input
                          type="datetime-local"
                          name="dateProchainVirement"
                          value={formData.dateProchainVirement}
                          onChange={handleChange}
                          className="flex-1 outline-none"
                        />
                      </div>
                      {getFieldError('dateProchainVirement')}
                      <span className="text-xs text-gray-500 mt-1">Date et heure prévues (optionnel)</span>
                    </div>
                  </div>

                  {/* Champs conditionnels basés sur la fréquence de paiement */}
                  {renderFrequencyFields()}

                  {/* ✅ Checkbox aPayer corrigé avec indicateur visuel */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="aPayer"
                        checked={formData.aPayer}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex flex-col">
                        <span className={`font-medium ${formData.aPayer ? 'text-green-600' : 'text-gray-700'}`}>
                          {formData.aPayer ? '✅ Agent à payer' : '❌ Agent non payé'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formData.aPayer 
                            ? 'Cet agent recevra des paiements automatiques selon la fréquence définie'
                            : 'Cet agent ne recevra pas de paiements automatiques'
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
                  title="Vérification OTP - Création de l'agent"
                  description="Un code OTP a été envoyé pour confirmer la création de l'agent. Veuillez saisir le code à 6 chiffres reçu par l'administrateur."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAgentModal;