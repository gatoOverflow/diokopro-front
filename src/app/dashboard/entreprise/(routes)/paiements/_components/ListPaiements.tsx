"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PaymentListView = ({ clients, agents }) => {
    // États pour la pagination
    const [paidAgentPage, setPaidAgentPage] = useState(1);
    const [unpaidAgentPage, setUnpaidAgentPage] = useState(1);
    const [paidClientPage, setPaidClientPage] = useState(1);
    const [unpaidClientPage, setUnpaidClientPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // États pour la recherche
    const [agentSearchTerm, setAgentSearchTerm] = useState('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');

    // États pour les données filtrées
    const [filteredPaidAgents, setFilteredPaidAgents] = useState([]);
    const [filteredUnpaidAgents, setFilteredUnpaidAgents] = useState([]);
    const [filteredPaidClients, setFilteredPaidClients] = useState([]);
    const [filteredUnpaidClients, setFilteredUnpaidClients] = useState([]);

    // Filtrage des agents
    useEffect(() => {
        if (agents && agents.length > 0) {
            const paidAgents = agents.filter(agent => agent.dejaPaye === true);
            const unpaidAgents = agents.filter(agent => agent.dejaPaye === false || agent.dejaPaye === undefined);
            
            if (agentSearchTerm.trim() !== '') {
                const normalizedSearchTerm = agentSearchTerm.toLowerCase().trim();
                
                const filteredPaid = paidAgents.filter(agent =>
                    agent.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    agent.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    agent.email?.toLowerCase().includes(normalizedSearchTerm) ||
                    agent.telephone?.includes(normalizedSearchTerm)
                );
                
                const filteredUnpaid = unpaidAgents.filter(agent =>
                    agent.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    agent.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    agent.email?.toLowerCase().includes(normalizedSearchTerm) ||
                    agent.telephone?.includes(normalizedSearchTerm)
                );
                
                setFilteredPaidAgents(filteredPaid);
                setFilteredUnpaidAgents(filteredUnpaid);
            } else {
                setFilteredPaidAgents(paidAgents);
                setFilteredUnpaidAgents(unpaidAgents);
            }
            
            setPaidAgentPage(1);
            setUnpaidAgentPage(1);
        }
    }, [agentSearchTerm, agents]);

    // Filtrage des clients
    useEffect(() => {
        if (clients && clients.length > 0) {
            const paidClients = clients.filter(client => client.aDejaPaye === true);
            const unpaidClients = clients.filter(client => client.aDejaPaye === false || client.aDejaPaye === undefined);
            
            if (clientSearchTerm.trim() !== '') {
                const normalizedSearchTerm = clientSearchTerm.toLowerCase().trim();
                
                const filteredPaid = paidClients.filter(client =>
                    client.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    client.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    client.email?.toLowerCase().includes(normalizedSearchTerm) ||
                    client.telephone?.includes(normalizedSearchTerm)
                );
                
                const filteredUnpaid = unpaidClients.filter(client =>
                    client.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    client.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    client.email?.toLowerCase().includes(normalizedSearchTerm) ||
                    client.telephone?.includes(normalizedSearchTerm)
                );
                
                setFilteredPaidClients(filteredPaid);
                setFilteredUnpaidClients(filteredUnpaid);
            } else {
                setFilteredPaidClients(paidClients);
                setFilteredUnpaidClients(unpaidClients);
            }
            
            setPaidClientPage(1);
            setUnpaidClientPage(1);
        }
    }, [clientSearchTerm, clients]);

    // Calculs de pagination pour les agents
    const paidAgentTotalPages = Math.ceil(filteredPaidAgents.length / ITEMS_PER_PAGE);
    const paidAgentStartIndex = (paidAgentPage - 1) * ITEMS_PER_PAGE;
    const displayedPaidAgents = filteredPaidAgents.slice(paidAgentStartIndex, paidAgentStartIndex + ITEMS_PER_PAGE);

    const unpaidAgentTotalPages = Math.ceil(filteredUnpaidAgents.length / ITEMS_PER_PAGE);
    const unpaidAgentStartIndex = (unpaidAgentPage - 1) * ITEMS_PER_PAGE;
    const displayedUnpaidAgents = filteredUnpaidAgents.slice(unpaidAgentStartIndex, unpaidAgentStartIndex + ITEMS_PER_PAGE);

    // Calculs de pagination pour les clients
    const paidClientTotalPages = Math.ceil(filteredPaidClients.length / ITEMS_PER_PAGE);
    const paidClientStartIndex = (paidClientPage - 1) * ITEMS_PER_PAGE;
    const displayedPaidClients = filteredPaidClients.slice(paidClientStartIndex, paidClientStartIndex + ITEMS_PER_PAGE);

    const unpaidClientTotalPages = Math.ceil(filteredUnpaidClients.length / ITEMS_PER_PAGE);
    const unpaidClientStartIndex = (unpaidClientPage - 1) * ITEMS_PER_PAGE;
    const displayedUnpaidClients = filteredUnpaidClients.slice(unpaidClientStartIndex, unpaidClientStartIndex + ITEMS_PER_PAGE);

    // Fonction pour le rendu de la pagination
    const renderPaginationControls = (currentPage, totalPages, setPage) => {
        if (totalPages <= 1) return null;
        
        // Pour créer une pagination similaire à celle de l'image
        return (
            <div className="flex items-center gap-2">
                {/* Bouton précédent */}
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-16 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <ChevronLeft size={20} />
                </button>
                
                {/* Affichage des numéros de page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-12 flex items-center justify-center rounded-lg ${
                                currentPage === pageNum
                                    ? "bg-orange-400 text-white"
                                    : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                
                {/* Bouton suivant */}
                <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-14 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    // Fonction pour générer des lignes vides
    const createEmptyRows = (count) => {
        return Array.from({ length: count }).map((_, index) => (
            <tr key={`empty-${index}`} className="h-14">
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap">
                    <div className="invisible">Espace</div>
                </td>
            </tr>
        ));
    };

    // Rendu des tableaux pour les agents avec hauteur fixe
    const renderAgentTable = (agents, isPaid) => {
        // Déterminer combien de lignes vides ajouter pour maintenir une hauteur constante
        const emptyRowsToAdd = Math.max(0, ITEMS_PER_PAGE - agents.length);
        
        return (
            <div className="bg-white rounded-lg shadow h-full flex flex-col">
                <div className="overflow-x-auto w-full flex-grow">
                    <table className="w-full table-auto h-full">
                        <thead>
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Nom(s)
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Prenom(s)
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Date d'inscription
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Montant
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Services
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {agents.length > 0 ? (
                                <>
                                    {agents.map((agent, index) => (
                                        <tr key={agent._id || index} className="hover:bg-gray-50 h-14">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 uppercase">
                                                    {agent.nom}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {agent.prenom}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                   {agent.dateCreation}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                   {agent.salaire}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {agent.servicesAffecte && agent.servicesAffecte.length > 0
                                                        ? agent.servicesAffecte[0]?.nomService
                                                        : ""
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {createEmptyRows(emptyRowsToAdd)}
                                </>
                            ) : (
                                <>
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            Aucun agent trouvé
                                        </td>
                                    </tr>
                                    {createEmptyRows(ITEMS_PER_PAGE - 1)}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center py-4 px-6 border-t border-gray-100 mt-auto">
                    <div className={`${
                        isPaid 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'
                    } px-6 py-2 rounded-full text-sm font-medium`}>
                        {isPaid ? 'Déjà Payés' : 'À Payés'}
                    </div>
                    
                    {isPaid 
                        ? renderPaginationControls(paidAgentPage, paidAgentTotalPages, setPaidAgentPage)
                        : renderPaginationControls(unpaidAgentPage, unpaidAgentTotalPages, setUnpaidAgentPage)
                    }
                </div>
            </div>
        );
    };

    // Rendu des tableaux pour les clients avec hauteur fixe
    const renderClientTable = (clients, isPaid) => {
        // Déterminer combien de lignes vides ajouter pour maintenir une hauteur constante
        const emptyRowsToAdd = Math.max(0, ITEMS_PER_PAGE - clients.length);
        
        return (
            <div className="bg-white rounded-lg shadow h-full flex flex-col">
                <div className="overflow-x-auto w-full flex-grow">
                    <table className="w-full table-auto h-full">
                        <thead>
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Nom(s)
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Prenom(s)
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                Date d'inscription
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Montant
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-800">
                                    Services
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients.length > 0 ? (
                                <>
                                    {clients.map((client, index) => (
                                        <tr key={client._id || index} className="hover:bg-gray-50 h-14">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 uppercase">
                                                    {client.nom || "IPSUM"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {client.prenom || "Lorem"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {client.dateCreation}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                {client.montantTotal}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {client.servicesChoisis && client.servicesChoisis.length > 0
                                                        ? client.servicesChoisis[0]?.nomService
                                                        : ""
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {createEmptyRows(emptyRowsToAdd)}
                                </>
                            ) : (
                                <>
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            Aucun client trouvé
                                        </td>
                                    </tr>
                                    {createEmptyRows(ITEMS_PER_PAGE - 1)}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center py-4 px-6 border-t border-gray-100 mt-auto">
                    <div className={`${
                        isPaid 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'
                    } px-6 py-2 rounded-full text-sm font-medium`}>
                        {isPaid ? 'Déjà Reçus' : 'Non Reçus'}
                    </div>
                    
                    {isPaid 
                        ? renderPaginationControls(paidClientPage, paidClientTotalPages, setPaidClientPage)
                        : renderPaginationControls(unpaidClientPage, unpaidClientTotalPages, setUnpaidClientPage)
                    }
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Section des agents */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-blue-500">Liste des Agents</h1>
                    <div className="relative rounded-full shadow-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Rechercher un agent"
                            className="pl-10 pr-10 py-2 w-64 rounded-full bg-white border border-gray-200"
                            value={agentSearchTerm}
                            onChange={(e) => setAgentSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-full">
                        {renderAgentTable(displayedPaidAgents, true)}
                    </div>
                    <div className="h-full">
                        {renderAgentTable(displayedUnpaidAgents, false)}
                    </div>
                </div>
            </div>

            {/* Section des clients */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-blue-500">Liste des Clients</h1>
                    <div className="relative rounded-full shadow-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Rechercher un client"
                            className="pl-10 pr-10 py-2 w-64 rounded-full bg-white border border-gray-200"
                            value={clientSearchTerm}
                            onChange={(e) => setClientSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-full">
                        {renderClientTable(displayedPaidClients, true)}
                    </div>
                    <div className="h-full">
                        {renderClientTable(displayedUnpaidClients, false)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentListView;