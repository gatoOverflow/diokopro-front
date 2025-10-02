// components/agent/AgentDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit, Wallet } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Composants modulaires
import AgentProfileTab from './AgentProfileTab';
import AgentTransfersTab from './AgentTransfersTab';
import AgentTransferDetails from './AgentTransferDetails';
import OtpInput from '../_Agent/OtpInput';
import { Agent, AgentDialogProps, NiveauService, OperationType, VirementRecu } from '@/app/lib/types';

// Types


const AgentDialog: React.FC<AgentDialogProps> = ({ 
  agent, 
  entrepriseId,
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  onRemoveFromService,
  onAddService,
  verifyOtp,
  services = []
}) => {
  const router = useRouter();
  
  // États principaux
  const [formData, setFormData] = useState<Partial<Agent>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingFromService, setIsRemovingFromService] = useState(false);
  
  // États pour les services
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedNiveauService, setSelectedNiveauService] = useState('');
  const [selectedServiceNiveaux, setSelectedServiceNiveaux] = useState<NiveauService[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  
  // États pour les virements
  const [selectedTransfer, setSelectedTransfer] = useState<VirementRecu | null>(null);
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // États OTP
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingChangeId, setPendingChangeId] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('update');

  // Réinitialisation
  useEffect(() => {
    if (agent) {
      setFormData({
        nom: agent.nom || '',
        prenom: agent.prenom || '',
        email: agent.email || '',
        telephone: agent.telephone || '',
        adresse: agent.adresse || '',
        nin: agent.nin || '',
        salaire: agent.salaire,
        dateProchainVirement: agent.dateProchainVirement || null,
        frequencePaiement: agent.frequencePaiement || 'mensuel',
        intervallePaiement: agent.intervallePaiement || 1,
        
        jourPaiement: agent.jourPaiement || 1,
        wallet: agent.wallet || '',
        aPayer: agent.aPayer || false,
      });
      setIsEditing(false);
      setShowOtpVerification(false);
      setOtpCode('');
      setPendingChangeId('');
      setOperationType('update');
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setIsAddingService(false);
      setSelectedTransfer(null);
      setShowTransferDetails(false);
      setActiveTab("profile");
    }
  }, [agent]);

  useEffect(() => {
    if (isEditing) {
      setActiveTab("profile");
    }
  }, [isEditing]);

  // Handlers
  
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Gestion spéciale pour la date de prochain virement
    if (name === 'dateProchainVirement') {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value || null 
        }));
    }
    // Gestion pour les champs numériques
    else if (name === 'salaire' || name === 'intervallePaiement' || name === 'jourPaiement') {
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

const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: checked 
    }));
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

  const handleShowTransferDetails = (transfer: VirementRecu) => {
    setSelectedTransfer(transfer);
    setShowTransferDetails(true);
  };

  const toggleAddServiceMode = () => {
    setIsAddingService(!isAddingService);
    if (!isAddingService) {
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setSelectedServiceNiveaux([]);
    }
  };

  const showDeleteConfirmation = () => setIsDeleting(true);
  
  const showRemoveFromServiceConfirmation = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsRemovingFromService(true);
  };

  // Opérations principales (simplifiées)
  const handleUpdate = async () => {
    if (!agent || !onUpdate) return;
    
    try {
      setIsVerifying(true);
      setOperationType('update');
      const result = await onUpdate({
        ...agent,
        ...formData,
        agentId: agent._id,
        entrepriseId
      });
      
      if (result?.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setIsEditing(false);
        setShowOtpVerification(true);
        toast.info("OTP code sent to administrator");
      } else if (result?.type === 'success') {
        toast.success("Agent updated successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Error during update");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddService = async () => {
    if (!agent || !onAddService || !selectedServiceId || !selectedNiveauService) {
      toast.error("Please select a service and level");
      return;
    }
    
    setIsAddingService(false);
    
    try {
      setIsVerifying(true);
      setOperationType('addService');
      
      const result = await onAddService({
        agentId: agent._id,
        serviceId: selectedServiceId,
        niveauService: selectedNiveauService,
        entrepriseId
      });
      
      const pendingId = result?.data?.pendingChangeId || result?.pendingChangeId;
      if (pendingId) {
        setPendingChangeId(pendingId);
        setShowOtpVerification(true);
        toast.info("OTP code sent to administrator");
      } else if (result?.type === 'success') {
        toast.success("Service added successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Error adding service");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteAgent = async () => {
    setIsDeleting(false);
    if (!agent || !onDelete) return;
    
    try {
      setIsVerifying(true);
      setOperationType('delete');
      
      const result = await onDelete({ agentId: agent._id, entrepriseId });
      
      if (result?.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info("OTP code sent to administrator");
      } else if (result?.type === 'success') {
        toast.success("Agent deleted successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Error during deletion");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveFromService = async (serviceId: string) => {
    setIsRemovingFromService(false);
    if (!agent || !onRemoveFromService) return;
    
    try {
      setIsVerifying(true);
      setOperationType('removeFromService');
      
      const result = await onRemoveFromService({
        agentId: agent._id,
        serviceId,
        entrepriseId
      });
      
      if (result?.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info("OTP code sent to administrator");
      } else if (result?.type === 'success') {
        toast.success("Agent removed from service!");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Error removing service");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

const handleOtpVerification = async () => {
    if (!pendingChangeId || !otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyOtp({
        code: otpCode, // Changé de 'otp' à 'code' pour correspondre à CombinedView
        pendingChangeId,
        actionType: operationType,
        serviceId: ['removeFromService', 'addService'].includes(operationType) ? selectedServiceId : undefined,
        niveauService: operationType === 'addService' ? selectedNiveauService : undefined,
        entrepriseId
      });
      
      if (result?.success || result?.type === 'success') {
        const messages = {
          update: "Agent updated successfully!",
          delete: "Agent deleted successfully!",
          removeFromService: "Agent removed from service!",
          addService: "Service added successfully!"
        };
        toast.success(messages[operationType]);
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "OTP verification failed");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  // Compter les virements valides
  const getValidTransfers = () => {
    if (!agent?.virementsRecus) return [];
    return agent.virementsRecus.filter(transfer => 
      transfer && (transfer.montant !== undefined || transfer.datePaiement || transfer.statut || transfer.expediteur)
    );
  };

  const transfersCount = getValidTransfers().length;

  if (!agent) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isVerifying) onClose();
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {showTransferDetails && selectedTransfer ? (
            <>
              <DialogHeader>
                <DialogTitle>Transfer Details</DialogTitle>
                <DialogDescription>Information about the transfer received</DialogDescription>
              </DialogHeader>
              
              <AgentTransferDetails 
                transfer={selectedTransfer}
                onBack={() => setShowTransferDetails(false)}
              />
            </>
          ) : showOtpVerification ? (
            <div>
              <OtpInput
                length={6}
                onComplete={setOtpCode}
                onSubmit={handleOtpVerification}
                disabled={isVerifying}
                isLoading={isVerifying}
                title={(() => {
                  const titles = {
                    update: "OTP Verification - Modification",
                    delete: "OTP Verification - Deletion", 
                    removeFromService: "OTP Verification - Service Removal",
                    addService: "OTP Verification - Service Addition"
                  };
                  return titles[operationType] || "OTP Verification";
                })()}
                description={(() => {
                  const descriptions = {
                    update: "An OTP code has been sent to confirm agent modification.",
                    delete: "An OTP code has been sent to confirm permanent deletion.",
                    removeFromService: "An OTP code has been sent to confirm service removal.",
                    addService: "An OTP code has been sent to confirm service addition."
                  };
                  return descriptions[operationType] || "A verification code has been sent.";
                })()}
              />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Agent Details</DialogTitle>
                <DialogDescription>{agent.nom} {agent.prenom}</DialogDescription>
              </DialogHeader>
              
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => !isEditing && setActiveTab(value)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="transfers" className="relative">
                    Transfers
                    {transfersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">
                        {transfersCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-0">
                  <AgentProfileTab
                    agent={agent}
                    isEditing={isEditing}
                    formData={formData}
                    onInputChange={handleInputChange}
                    services={services}
                    isAddingService={isAddingService}
                    selectedServiceId={selectedServiceId}
                    selectedNiveauService={selectedNiveauService}
                    selectedServiceNiveaux={selectedServiceNiveaux}
                    onAddService={handleAddService}
                    onCheckboxChange={handleCheckboxChange}
                    onRemoveFromService={onRemoveFromService}
                    toggleAddServiceMode={toggleAddServiceMode}
                    handleServiceChange={handleServiceChange}
                    handleNiveauServiceChange={handleNiveauServiceChange}
                    showRemoveFromServiceConfirmation={showRemoveFromServiceConfirmation}
                  />
                </TabsContent>
                
                <TabsContent value="transfers" className="mt-0">
                  <AgentTransfersTab
                    agent={agent}
                    onShowTransferDetails={handleShowTransferDetails}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-4 gap-2">
                {!isEditing && onDelete && (
                  <Button variant="destructive" size="sm" onClick={showDeleteConfirmation}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                
                <div className="ml-auto flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate} disabled={isVerifying}>
                        {isVerifying ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogues de confirmation */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the agent and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isRemovingFromService} onOpenChange={setIsRemovingFromService}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from service</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this agent from the selected service? This requires OTP verification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveFromService(selectedServiceId)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Remove from service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AgentDialog;