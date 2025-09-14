"use client";
import React, { useState, useCallback } from 'react';
import { Toaster, toast } from "sonner";

import BalanceEntreprise from '../Balance/BalanceEntreprise';
import ServiceDialog from '../_services/ServiceDialog';
import ClientDialog from '../_clients/ClientDialog';
import AgentDialog from '../_Agent/AgentDialog';
import GerantDialog from '../_gerant/GerantDialog';
import { updateClient, deleteClient, removeClientFromService, addServiceToClient, addServiceToAgent, removeAgentFromService } from '@/actions/clientreq';
import { validateOTP } from '@/actions/service';
import { updatedGerant } from '@/actions/gerant';
import { deleteAgent, updatedAgent } from '@/actions/Agent';
import MetricsCards from './Components/MetricsCards';
import AgentsList from './Components/AgentsList';
import ClientsList from './Components/ClientsList';
import ServicesList from './Components/ServicesList';

const CombinedView = ({
    services,
    serviceId,
    balance,
    clients,
    agentNotTopayer,
    agentapayer,
    agents,
    gerants,
    clientNotTopayer,
    entrepriseId,
    nomEntreprise
}) => {
    // États pour les éléments sélectionnés
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [selectedGerant, setSelectedGerant] = useState(null);

    // États pour les dialogues
    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
    const [isGerantDialogOpen, setIsGerantDialogOpen] = useState(false);

    // Gestionnaires d'événements optimisés avec useCallback
    const handleServiceClick = useCallback((service) => {
        setSelectedService(service);
        setIsServiceDialogOpen(true);
    }, []);

    const handleClientClick = useCallback((client) => {
        setSelectedClient(client);
        setIsClientDialogOpen(true);
    }, []);

    const handleAgentClick = useCallback((agent) => {
        setSelectedAgent(agent);
        setIsAgentDialogOpen(true);
    }, []);

    const handleGerantClick = useCallback((gerant) => {
        setSelectedGerant(gerant);
        setIsGerantDialogOpen(true);
    }, []);

    const handleAddServiceToAgent = useCallback(async (data) => {
        try {
            if (!data.agentId || !data.serviceId || !data.niveauService) {
                toast.error("Données de service invalides");
                return { type: 'error', error: "Données de service invalides" };
            }

            const serviceData = {
                ...data,
                entrepriseId: entrepriseId
            };

            const result = await addServiceToAgent(serviceData);
            
            if (result.pendingChangeId) {
                return {
                    type: 'pending',
                    message: result.message || "Un code OTP a été envoyé à l'administrateur",
                    data: {
                        pendingChangeId: result.pendingChangeId
                    }
                };
            } else if (result.type === 'success') {
                toast.success(result.message || "Service ajouté avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de l'ajout du service");
            }
            
            return result;
        } catch (error) {
            console.error("Erreur lors de l'ajout du service à l'agent:", error);
            toast.error("Une erreur est survenue lors de l'ajout du service");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

    const handleUpdateClient = useCallback(async (updatedClient) => {
        try {
            if (!updatedClient || !updatedClient._id) {
                toast.error("Données du client invalides");
                return { type: 'error', error: "Données du client invalides" };
            }

            const clientData = {
                ...updatedClient,
                clientId: updatedClient._id,
                entrepriseId: entrepriseId,
                serviceId: updatedClient.servicesChoisis?.[0]?._id
            };

            const result = await updateClient(clientData);
            if (result.type === 'success') {
                toast.success(result.message || "Client mis à jour avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la mise à jour");
            }
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

    const handleAddServiceToClient = useCallback(async (data) => {
        try {
            if (!data.clientId || !data.serviceId || !data.niveauService) {
                toast.error("Données de service invalides");
                return { type: 'error', error: "Données de service invalides" };
            }

            const serviceData = {
                ...data,
                entrepriseId: entrepriseId
            };

            const result = await addServiceToClient(serviceData);
            
            if (result.pendingChangeId) {
                return {
                    type: 'pending',
                    message: result.message || "Un code OTP a été envoyé à l'administrateur",
                    data: {
                        pendingChangeId: result.pendingChangeId
                    }
                };
            } else if (result.type === 'success') {
                toast.success(result.message || "Service ajouté avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de l'ajout du service");
            }
            
            return result;
        } catch (error) {
            console.error("Erreur lors de l'ajout du service:", error);
            toast.error("Une erreur est survenue lors de l'ajout du service");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

    const handleUpdateAgent = useCallback(async (updateAgent) => {
        try {
            if (!updateAgent || !updateAgent._id) {
                toast.error("Données de l'agent invalides");
                return { type: 'error', error: "Données de l'agent invalides" };
            }

            const agentData = {
                ...updateAgent,
                agentId: updateAgent._id,
                entrepriseId: entrepriseId,
            };

            const result = await updatedAgent(agentData);
            if (result.type === 'success') {
                toast.success(result.message || "Agent mis à jour avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la mise à jour");
            }
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

    const handleUpdateGerant = useCallback(async (updatedGerant) => {
        try {
            if (!updatedGerant || !updatedGerant._id) {
                toast.error("Données du gérant invalides");
                return { type: 'error', error: "Données du gérant invalides" };
            }

            const gerantData = {
                ...updatedGerant,
                agentId: updatedGerant._id,
                entrepriseId: entrepriseId,
            };

            const result = await updatedGerant(gerantData);
            if (result.type === 'success') {
                toast.success(result.message || "Gérant mis à jour avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la mise à jour");
            }
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

    const handleUpdateService = useCallback((updatedService) => {
        setIsServiceDialogOpen(false);
    }, []);

    const handleVerifyClientOtp = useCallback(async (formData) => {
        try {
            let code, pendingChangeId;
            
            if (formData instanceof FormData) {
                code = formData.get('code') || formData.get('otp');
                pendingChangeId = formData.get('pendingChangeId');
            } 
            else if (formData.target) {
                const form = formData.target;
                code = form.code?.value || form.otp?.value;
                pendingChangeId = form.pendingChangeId?.value;
            }
            else {
                code = formData.code || formData.otp;
                pendingChangeId = formData.pendingChangeId;
            }

            if (!code || code.toString().trim().length === 0) {
                return {
                    type: 'error',
                    error: "Le code OTP est requis"
                };
            }

            const cleanCode = code.toString().trim();
            
            if (!/^\d{4,8}$/.test(cleanCode)) {
                return {
                    type: 'error',
                    error: "Le code OTP doit contenir entre 4 et 8 chiffres"
                };
            }

            if (!pendingChangeId) {
                return {
                    type: 'error',
                    error: "ID de changement en attente manquant"
                };
            }

            const changeId = String(pendingChangeId);
            
            const result = await validateOTP(changeId, cleanCode, entrepriseId);

            if (result && result.success) {
                return {
                    type: 'success',
                    message: result.data?.message || "Validation réussie"
                };
            } else {
                let errorMsg = "Échec de la vérification OTP";

                if (result?.error) {
                    errorMsg = result.error;
                } else if (result?.errors) {
                    if (result.errors.otp && result.errors.otp.length > 0) {
                        errorMsg = result.errors.otp[0];
                    } else if (result.errors.pendingChangeId && result.errors.pendingChangeId.length > 0) {
                        errorMsg = result.errors.pendingChangeId[0];
                    } else if (typeof result.errors === 'string') {
                        errorMsg = result.errors;
                    }
                }

                return { type: 'error', error: errorMsg };
            }
        } catch (error) {
            console.error("Erreur lors de la vérification OTP:", error);
            return {
                type: 'error',
                error: error.message || "Échec de la vérification OTP"
            };
        }
    }, [entrepriseId]);

    const handleRemoveClientFromService = useCallback(async (formData) => {
        try {
            const result = await removeClientFromService(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Client retiré du service avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec du retrait du service");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors du retrait du service');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

    const handleRemoveAgentFromService = useCallback(async (formData) => {
        try {
            const result = await removeAgentFromService(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Agent retiré du service avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec du retrait du service");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors du retrait du service');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

    const handleDeleteClient = useCallback(async (formData) => {
        try {
            const result = await deleteClient(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Client supprimé avec succès");
                setIsClientDialogOpen(false);
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la suppression");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors de la suppression');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

    const handleDeleteAgent = useCallback(async (formData) => {
        try {
            const result = await deleteAgent(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Agent supprimé avec succès");
                setIsAgentDialogOpen(false);
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la suppression");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors de la suppression');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <Toaster position="top-center" />

            <div className="w-full max-w-full mx-auto space-y-6">
                {/* Section du haut - Métriques et Gestion de compte */}
                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* 4 cartes de métriques */}
                        <div className="flex-1">
                            <MetricsCards 
                                agentsCount={agents.length} 
                                clientsCount={clients.length} 
                                servicesCount={services.length}
                                //gerantsCount={gerants.length}
                                entrepriseId={entrepriseId}
                                nomEntreprise={nomEntreprise}
                                services={services}
                            />
                        </div>
                        
                        {/* Gestion de compte et Messagerie */}
                        <div className="lg:w-[320px] space-y-4">
                            <BalanceEntreprise 
                                balances={balance} 
                                entrepriseId={entrepriseId}
                            />
                        </div>
                    </div>
                </div>

                {/* Section du bas - Listes dans l'ordre demandé */}
                <div className="space-y-6">
                    {/* Liste des Agents (en premier) */}
                    <div>
                        <AgentsList 
                            agents={agents} 
                            onAgentClick={handleAgentClick} 
                        />
                    </div>
                    
                    {/* Liste des Clients (en deuxième) */}
                    <div>
                        <ClientsList 
                            clients={clients} 
                            onClientClick={handleClientClick} 
                        />
                    </div>

                    {/* Les Services (en troisième) */}
                    <div>
                        <ServicesList 
                            services={services} 
                            onServiceClick={handleServiceClick} 
                        />
                    </div>
                </div>
            </div>

            {/* Dialogs pour chaque type d'entité */}
            {isServiceDialogOpen && (
                <ServiceDialog
                    service={selectedService}
                    isOpen={isServiceDialogOpen}
                    onClose={() => setIsServiceDialogOpen(false)}
                    onUpdate={handleUpdateService}
                    entrepriseId={entrepriseId}
                />
            )}

            {isClientDialogOpen && (
                <ClientDialog
                    client={selectedClient}
                    entrepriseId={entrepriseId}
                    isOpen={isClientDialogOpen}
                    onClose={() => setIsClientDialogOpen(false)}
                    onUpdate={handleUpdateClient}
                    onDelete={handleDeleteClient}
                    onRemoveFromService={handleRemoveClientFromService}
                    onAddService={handleAddServiceToClient}
                    verifyOtp={handleVerifyClientOtp}
                    services={services}
                />
            )}

            {isAgentDialogOpen && (
                <AgentDialog
                    agent={selectedAgent}
                    isOpen={isAgentDialogOpen}
                    onClose={() => setIsAgentDialogOpen(false)}
                    onUpdate={handleUpdateAgent}
                    onDelete={handleDeleteAgent}
                    verifyOtp={handleVerifyClientOtp}
                    entrepriseId={entrepriseId}
                    onRemoveFromService={handleRemoveAgentFromService}
                    services={services}
                    onAddService={handleAddServiceToAgent}
                />
            )}

            {isGerantDialogOpen && (
                <GerantDialog
                    gerant={selectedGerant}
                    isOpen={isGerantDialogOpen}
                    entrepriseId={entrepriseId}
                    onClose={() => setIsGerantDialogOpen(false)}
                    onUpdate={handleUpdateGerant}
                    onDelete={handleDeleteClient}
                    verifyOtp={handleVerifyClientOtp}
                />
            )}
        </div>
    );
};

export default CombinedView;