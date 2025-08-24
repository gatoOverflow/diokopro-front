// hooks/useClientDialog.ts

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Client, Service, NiveauService, Paiement, OperationType } from '@/app/lib/types';

export const useClientDialog = (
  client: Client | null,
  entrepriseId: string,
  onUpdate?: (updatedClient: any) => Promise<any>,
  onDelete?: (formData: any) => Promise<any>,
  onRemoveFromService?: (formData: any) => Promise<any>,
  onAddService?: (formData: any) => Promise<any>,
  verifyOtp?: (formData: any) => Promise<any>,
  services: Service[] = []
) => {
  const router = useRouter();
  
  // États pour la gestion du formulaire
  const [formData, setFormData] = useState<Partial<Client>>({});
  
  // États pour la gestion des opérations
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingFromService, setIsRemovingFromService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedNiveauService, setSelectedNiveauService] = useState('');
  const [selectedServiceNiveaux, setSelectedServiceNiveaux] = useState<NiveauService[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);

  // États pour les paiements
  const [selectedPayment, setSelectedPayment] = useState<Paiement | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // États pour la gestion de l'OTP
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingChangeId, setPendingChangeId] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('update');

  // Réinitialiser le formulaire lorsque le client change
  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom || '',
        prenom: client.prenom || '',
        email: client.email || '',
        telephone: client.telephone || '',
        adresse: client.adresse || '',
        nin: client.nin || '',
         aFAirePayer: client.aFAirePayer,
        dateProgrammee: client.dateProgrammee || null,
        
        // Champs de paiement
      
        frequencePaiement: client.frequencePaiement || 'mensuel',
        intervallePaiement: client.intervallePaiement || 1,
       
      });
      setIsEditing(false);
      setShowOtpVerification(false);
      setOtpCode('');
      setPendingChangeId('');
      setOperationType('update');
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setIsAddingService(false);
      setSelectedPayment(null);
      setShowPaymentDetails(false);
      setActiveTab("profile");
    }
  }, [client]);

  // Forcer l'onglet profil quand l'édition commence
  useEffect(() => {
    if (isEditing) {
      setActiveTab("profile");
    }
  }, [isEditing]);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  
  console.log(`Changement de ${name}:`, value); // Debug
  
  // Gestion spéciale pour la date programmée
  if (name === 'dateProgrammee') {
    setFormData(prev => ({
      ...prev,
      [name]: value || null
    }));
  }
  // Gestion pour les champs numériques
  else if (name === 'montantTotal' || name === 'intervallePaiement') {
    setFormData(prev => ({
      ...prev,
      [name]: value ? Number(value) : ''
    }));
  }
  // Autres champs
  else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedServiceId(selectedId);
    
    const selectedService = services.find(service => service._id === selectedId);
    if (selectedService && selectedService.niveauxDisponibles) {
      setSelectedServiceNiveaux(selectedService.niveauxDisponibles);
      setSelectedNiveauService('');
    } else {
      setSelectedServiceNiveaux([]);
    }
  };

  const handleNiveauServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNiveauService(e.target.value);
  };

  const handleShowPaymentDetails = (payment: Paiement) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const toggleAddServiceMode = () => {
    setIsAddingService(!isAddingService);
    if (!isAddingService) {
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setSelectedServiceNiveaux([]);
    }
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, checked } = e.target;
  console.log(`Checkbox ${name} changé:`, checked); // Debug
  setFormData(prev => ({
    ...prev,
    [name]: checked
  }));
};

  const showDeleteConfirmation = () => {
    setIsDeleting(true);
  };
  
  const showRemoveFromServiceConfirmation = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsRemovingFromService(true);
  };

  // Opérations principales
  const handleUpdate = async () => {
    if (!client || !onUpdate) return;
    
    const updatedClient = {
      ...client,
      ...formData,
      clientId: client._id,
      entrepriseId: entrepriseId,
      serviceId: client.servicesChoisis?.[0]?._id
    };
    
    try {
      setIsVerifying(true);
      setOperationType('update');
      const result = await onUpdate(updatedClient);
      
      if (!result) {
        console.error("Résultat de mise à jour indéfini");
        toast.error("Erreur lors de la mise à jour");
        setIsVerifying(false);
        return;
      }
      
      if (result.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setIsEditing(false);
        setShowOtpVerification(true);
        toast.info(result.message || "Un code OTP a été envoyé à l'administrateur");
      } else if (result.type === 'success' || result.data?.type === 'success') {
        toast.success("Le client a été mis à jour avec succès!");
        return { success: true };
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error during update:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddService = async () => {
    if (!client || !onAddService || !selectedServiceId || !selectedNiveauService) {
      toast.error("Veuillez sélectionner un service et un niveau");
      return;
    }
    
    setIsAddingService(false);
    
    try {
      setIsVerifying(true);
      setOperationType('addService');
      
      const addServiceData = {
        clientId: client._id,
        serviceId: selectedServiceId,
        niveauService: selectedNiveauService,
        entrepriseId: entrepriseId
      };
      
      const result = await onAddService(addServiceData);
      
      if (!result) {
        toast.error("Erreur lors de l'ajout du service");
        setIsVerifying(false);
        return;
      }
      
      if (
        (result.type === 'pending' && result.data?.pendingChangeId) ||
        (result.pendingChangeId) ||
        (result.message && result.message.includes("attente de validation") && result.pendingChangeId)
      ) {
        const pendingId = result.data?.pendingChangeId || result.pendingChangeId;
        setPendingChangeId(pendingId);
        setShowOtpVerification(true);
        toast.info(result.message || "Un code OTP a été envoyé à l'administrateur pour confirmer l'ajout du service");
      } else if (result.type === 'success') {
        toast.success("Le service a été ajouté avec succès!");
        return { success: true };
      } else {
        toast.error(result.message || result.error || "Erreur lors de l'ajout du service");
      }
    } catch (error) {
      console.error("Error during service addition:", error);
      toast.error("Une erreur est survenue lors de l'ajout du service");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteClient = async () => {
    setIsDeleting(false);
    
    if (!client || !onDelete) return;
    
    try {
      setIsVerifying(true);
      setOperationType('delete');
      
      const deleteData = {
        clientId: client._id,
        entrepriseId: entrepriseId
      };
      
      const result = await onDelete(deleteData);
      
      if (!result) {
        toast.error("Erreur lors de la suppression");
        setIsVerifying(false);
        return;
      }
      
      if (result.type === 'pending' && result.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info(result.message || "Un code OTP a été envoyé à l'administrateur pour confirmer la suppression");
      } else if (result.type === 'success') {
        toast.success("Le client a été supprimé avec succès!");
        return { success: true };
      } else {
        toast.error(result.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveFromService = async (serviceId: string) => {
    setIsRemovingFromService(false);
    
    if (!client || !onRemoveFromService) return;
    
    try {
      setIsVerifying(true);
      setOperationType('removeFromService');
      setSelectedServiceId(serviceId);
      
      const removeData = {
        clientId: client._id,
        serviceId: serviceId,
        entrepriseId: entrepriseId
      };
      
      const result = await onRemoveFromService(removeData);
      
      if (!result) {
        toast.error("Erreur lors de la suppression du service");
        setIsVerifying(false);
        return;
      }
      
      if (result.type === 'pending' && result.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info(result.message || "Un code OTP a été envoyé à l'administrateur pour confirmer la suppression du service");
      } else if (result.type === 'success') {
        toast.success("Le client a été retiré du service avec succès!");
        return { success: true };
      } else {
        toast.error(result.message || "Erreur lors de la suppression du service");
      }
    } catch (error) {
      console.error("Error during service removal:", error);
      toast.error("Une erreur est survenue lors de la suppression du service");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!pendingChangeId) {
      console.error("Aucun identifiant de changement en attente");
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    setIsVerifying(true);
    try {
      const otpData = {
        otp: otpCode,
        code: otpCode,
        pendingChangeId: pendingChangeId,
        actionType: operationType,
        serviceId: ['removeFromService', 'addService'].includes(operationType) ? selectedServiceId : undefined,
        niveauService: operationType === 'addService' ? selectedNiveauService : undefined,
        entrepriseId: entrepriseId
      };
      
      const result = await verifyOtp?.(otpData);
      
      if (!result) {
        console.error("Résultat de vérification OTP indéfini");
        toast.error("Échec de la vérification OTP");
        return;
      }
      
      if (result.success || result.type === 'success' || result.status === 'success' || 
          (result.data && (result.data.type === 'success' || result.data.status === 'success'))) {
        let successMessage = "";
        
        switch(operationType) {
          case 'update':
            successMessage = "Le client a été mis à jour avec succès!";
            break;
          case 'delete':
            successMessage = "Le client a été supprimé avec succès!";
            break;
          case 'removeFromService':
            successMessage = "Le client a été retiré du service avec succès!";
            break;
          case 'addService':
            successMessage = "Le service a été ajouté au client avec succès!";
            break;
          default:
            successMessage = "Opération réussie!";
        }
        
        toast.success(successMessage);
        return { success: true };
      } else {
        const errorMsg = result.message || result.error || "Échec de la vérification OTP";
        toast.error(errorMsg);
        
        if (result.errors) {
          Object.values(result.errors).forEach((errorArray: any) => {
            if (Array.isArray(errorArray)) {
              errorArray.forEach((error: string) => {
                toast.error(error);
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Échec de la vérification. Veuillez réessayer.");
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    // États
    formData,
    isEditing,
    isDeleting,
    isRemovingFromService,
    selectedServiceId,
    selectedNiveauService,
    selectedServiceNiveaux,
    isAddingService,
    selectedPayment,
    showPaymentDetails,
    activeTab,
    otpCode,
    isVerifying,
    showOtpVerification,
    pendingChangeId,
    operationType,
    
    // Setters
    setIsEditing,
    setIsDeleting,
    setIsRemovingFromService,
    setActiveTab,
    setOtpCode,
    setShowPaymentDetails,
    
    // Handlers
    handleInputChange,
    handleServiceChange,
    handleNiveauServiceChange,
    handleCheckboxChange, 
    handleShowPaymentDetails,
    toggleAddServiceMode,
    showDeleteConfirmation,
    showRemoveFromServiceConfirmation,
    handleUpdate,
    handleAddService,
    handleDeleteClient,
    handleRemoveFromService,
    handleOtpVerification
  };
};