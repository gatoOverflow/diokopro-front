"use client";

import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { refuseEntreprise, updateEntrepriseStatus } from '@/actions/acceptEntreprise';
import { InterfaceEntreprise } from '../../../_models/entreprise.model';
import Pagination from '@/app/dashboard/entreprise/_components/CombinedView/Components/Pagination';

interface EntrepriseListProps {
    entreprises?: InterfaceEntreprise[];
    isLoading?: boolean;
    error?: string | null;
}

const EntrepriseInactive: React.FC<EntrepriseListProps> = ({
    entreprises = [],
    isLoading = false,
    error = null,
}) => {
    const [open, setOpen] = useState(false);
    const [selectedEntreprise, setSelectedEntreprise] = useState<InterfaceEntreprise | null>(null);
    const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [raisonRefus, setRaisonRefus] = useState("");
    const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [postulantSearchTerm, setPostulantSearchTerm] = useState('');
    const [choisisSearchTerm, setChoisisSearchTerm] = useState('');
    const [rejetesSearchTerm, setRejetesSearchTerm] = useState('');
    
    const [postulantPage, setPostulantPage] = useState(1);
    const [choisisPage, setChoisisPage] = useState(1);
    const [rejetesPage, setRejetesPage] = useState(1);
    
    const itemsPerPage = 3;

    const getFilteredEntreprises = (status: 'postulants' | 'choisis' | 'rejetes', page: number) => {
        let filtered = entreprises;
        let searchTerm = '';
        
        switch (status) {
            case 'postulants':
                filtered = entreprises.filter(e => !e.estActif);
                searchTerm = postulantSearchTerm;
                break;
            case 'choisis':
                filtered = entreprises.filter(e => e.estActif);
                searchTerm = choisisSearchTerm;
                break;
            case 'rejetes':
                filtered = entreprises.filter(e => !e.estActif);
                searchTerm = rejetesSearchTerm;
                break;
        }

        if (searchTerm) {
            filtered = filtered.filter(entreprise =>
                entreprise.nomEntreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entreprise.ninea.includes(searchTerm) ||
                entreprise.rccm?.includes(searchTerm) ||
                entreprise.representéPar.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);
        
        return {
            data: paginatedData,
            totalPages: totalPages || 1
        };
    };

    const openAcceptDialog = (e: React.MouseEvent, entreprise: InterfaceEntreprise) => {
        e.stopPropagation();
        setSelectedEntreprise(entreprise);
        setActionType('accept');
        setOpen(true);
        setUpdateMessage(null);
    };

    const openRejectDialog = (e: React.MouseEvent, entreprise: InterfaceEntreprise) => {
        e.stopPropagation();
        setSelectedEntreprise(entreprise);
        setActionType('reject');
        setOpen(true);
        setUpdateMessage(null);
    };

    const handleRefuse = async () => {
        if (!selectedEntreprise || !raisonRefus.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await refuseEntreprise({
                entrepriseId: selectedEntreprise._id,
                raisonRefus: raisonRefus
            });

            if (result.type === "success") {
                setUpdateMessage({
                    type: 'success',
                    message: result.message || `L'entreprise ${selectedEntreprise.nomEntreprise} a été refusée avec succès.`
                });
                setTimeout(() => {
                    window.location.reload();
                    setOpen(false);
                }, 1500);
            } else {
                setUpdateMessage({
                    type: 'error',
                    message: result.error || "Erreur lors du refus de l'entreprise."
                });
            }
        } catch (error) {
            console.error("Error refusing enterprise:", error);
            setUpdateMessage({
                type: 'error',
                message: "Erreur lors du refus de l'entreprise."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedEntreprise || !actionType) return;

        setIsSubmitting(true);
        try {
            const newStatus = actionType === 'accept';

            const result = await updateEntrepriseStatus({
                entrepriseId: selectedEntreprise._id,
                estActif: newStatus
            });

            if (result.type === "success") {
                setUpdateMessage({
                    type: 'success',
                    message: result.message || `L'entreprise ${selectedEntreprise.nomEntreprise} a été ${newStatus ? 'acceptée' : 'refusée'} avec succès.`
                });

                setTimeout(() => {
                    window.location.reload();
                    setOpen(false);
                }, 1500);
            } else {
                setUpdateMessage({
                    type: 'error',
                    message: result.error || `Une erreur est survenue lors de ${newStatus ? 'l\'acceptation' : 'du refus'} de l'entreprise.`
                });
            }

        } catch (error: any) {
            console.error("Error updating status:", error);
            setUpdateMessage({
                type: 'error',
                message: `Une erreur est survenue lors de ${actionType === 'accept' ? 'l\'acceptation' : 'du refus'} de l'entreprise.`
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-8 w-full mb-4" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-red-500 p-6">Erreur: {error}</div>
                </div>
            </div>
        );
    }

    const renderPanel = (title: string, status: 'postulants' | 'choisis' | 'rejetes') => {
        let currentPage;
        let setPage;

        switch (status) {
            case 'postulants':
                currentPage = postulantPage;
                setPage = setPostulantPage;
                break;
            case 'choisis':
                currentPage = choisisPage;
                setPage = setChoisisPage;
                break;
            case 'rejetes':
                currentPage = rejetesPage;
                setPage = setRejetesPage;
                break;
            default:
                currentPage = 1;
                setPage = () => {};
        }
        
        const { data: filteredEntreprises, totalPages } = getFilteredEntreprises(status, currentPage);
        
        return (
            <div className="bg-white rounded-lg shadow-2xl w-full">
                {/* Header avec recherche */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-medium text-blue-500 whitespace-nowrap">
                        {title}
                    </h2>
                    <div className="w-full sm:ml-auto sm:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={
                                    status === 'postulants' 
                                        ? postulantSearchTerm 
                                        : status === 'choisis' 
                                            ? choisisSearchTerm 
                                            : rejetesSearchTerm
                                }
                                onChange={(e) => {
                                    if (status === 'postulants') {
                                        setPostulantSearchTerm(e.target.value);
                                        setPostulantPage(1);
                                    } else if (status === 'choisis') {
                                        setChoisisSearchTerm(e.target.value);
                                        setChoisisPage(1);
                                    } else if (status === 'rejetes') {
                                        setRejetesSearchTerm(e.target.value);
                                        setRejetesPage(1);
                                    }
                                }}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* En-têtes de tableau - cachés sur mobile */}
                <div className="hidden md:flex w-full justify-between px-4 py-3 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">Société</div>
                    <div className="font-semibold text-gray-900">NINEA/RCCM</div>
                </div>

                {/* Corps du tableau */}
                <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
                    {filteredEntreprises.length > 0 ? (
                        filteredEntreprises.map((entreprise) => (
                            <div key={entreprise._id} className="flex flex-col md:flex-row w-full md:items-center p-3 md:py-3 border-b border-gray-100 hover:bg-gray-50 gap-3">
                                {/* Section Société */}
                                <div className="w-full md:w-1/2 md:pl-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-gray-900 truncate">{entreprise.nomEntreprise}</div>
                                            <div className="text-sm text-gray-500 truncate">{entreprise.representéPar}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Section NINEA et Actions */}
                                <div className="w-full md:w-1/2 md:pr-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div className="text-gray-700 text-sm md:text-base">
                                            <span className="md:hidden font-medium">NINEA: </span>
                                            <span>{entreprise.ninea}</span>
                                        </div>
                                        {status === 'postulants' && (
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={(e) => openAcceptDialog(e, entreprise)}
                                                    className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-1 text-xs sm:text-sm rounded transition-colors"
                                                >
                                                    Accepter
                                                </button>
                                                <button
                                                    onClick={(e) => openRejectDialog(e, entreprise)}
                                                    className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-1 text-xs sm:text-sm rounded transition-colors"
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-32 text-gray-500 text-sm">
                            Aucune entreprise trouvée
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => setPage(page)} 
                />
            </div>
        );
    };

    return (
        <div className="flex p-3 sm:p-4 lg:p-6 bg-gray-50">
            {/* Grille responsive: 1 colonne sur mobile, 2 colonnes sur desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {/* Panneau Postulants */}
                <div className="w-full">
                    {renderPanel("Postulants", "postulants")}
                </div>

                {/* Colonne de droite - Choisis et Rejetés */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Panneau Choisis */}
                    <div className="w-full">
                        {renderPanel("Choisis", "choisis")}
                    </div>

                    {/* Panneau Rejetés */}
                    <div className="w-full">
                        {renderPanel("Rejetés", "rejetes")}
                    </div>
                </div>
            </div>

            {/* Dialogue de confirmation */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md mx-4 max-w-[calc(100%-2rem)]">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">
                            {actionType === 'accept' ? 'Accepter l\'entreprise' : 'Refuser l\'entreprise'}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            {selectedEntreprise && (
                                <>
                                    {actionType === 'accept'
                                        ? `Voulez-vous accepter l'entreprise ${selectedEntreprise.nomEntreprise} ?`
                                        : `Voulez-vous refuser l'entreprise ${selectedEntreprise.nomEntreprise} ?`}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Formulaire pour la raison du refus */}
                    {actionType === 'reject' && (
                        <div className="space-y-4">
                            <label htmlFor="raisonRefus" className="block text-sm font-medium text-gray-700">
                                Raison du refus
                            </label>
                            <textarea
                                id="raisonRefus"
                                value={raisonRefus}
                                onChange={(e) => setRaisonRefus(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                rows={3}
                                placeholder="Entrez la raison du refus..."
                                required
                            />
                        </div>
                    )}

                    {updateMessage && (
                        <div className={`py-2 px-3 rounded text-sm ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {updateMessage.message}
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                Annuler
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={actionType === 'accept' ? handleUpdateStatus : handleRefuse}
                            disabled={isSubmitting}
                            variant={actionType === 'accept' ? "default" : "destructive"}
                            className={`w-full sm:w-auto ${actionType === 'accept' ? "bg-green-600 hover:bg-green-700" : ""}`}
                        >
                            {isSubmitting ? 'En cours...' : actionType === 'accept' ? 'Accepter' : 'Refuser'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EntrepriseInactive;