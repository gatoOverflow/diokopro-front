"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Types
interface servicesAffecte {
  _id: string;
  nomService: string;
  description: string;
  tarifactionBase: number;
  gerants: string[];
}

interface Agent {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  adresse: string;
  nin: string;
  estNouveau: boolean;
  dateCreation: string;
  servicesAffecte: servicesAffecte[];
  paiementsEffectues: any[];
  __v: number;
}

interface Service {
  _id: string;
  nom: string;
  prenom?: string;
  tarifactionBase?: number;
  gerants?: string[];
  entrepriseId?: string;
}

interface GerantsByServiceViewProps {
  gerants: Agent[];
  services: Service[];
  entrepriseId: string;
  currentUser?: any; // Added this prop that was referenced but not defined
}

const ITEMS_PER_PAGE = 10;

const GerantsView: React.FC<GerantsByServiceViewProps> = ({ 
  gerants = [], // Provide default empty array
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('tous');

  const isNewAgent = (dateCreation: string): boolean => {
    const creationDate = new Date(dateCreation);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000; 
    
    return now.getTime() - creationDate.getTime() < oneDayInMs;
  };

  // Add safety check - only filter if gerants exists and is an array
  const filteredAgents = (gerants && Array.isArray(gerants)) ? gerants.filter(agent => {
    const matchesSearch = 
      `${agent.nom || ''} ${agent.prenom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.telephone || '').includes(searchTerm);
    
    if (activeFilter === 'nouveaux') {
      return matchesSearch && isNewAgent(agent.dateCreation);
    }
    
    return matchesSearch;
  }) : [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredAgents.length);
  const currentAgents = filteredAgents.slice(startIndex, endIndex);

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Barre de navigation supérieure - utilise l'utilisateur connecté */}
        
        <div className="p-6">
          {/* Header and filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-blue-500">Liste des Agents</h1>
              
              <div className="flex space-x-4">
                {/* Filtres */}
                <div className="bg-gray-200 rounded-full overflow-hidden flex">
                  <button
                    onClick={() => setActiveFilter('tous')}
                    className={`px-6 py-2 text-sm font-medium ${
                      activeFilter === 'tous' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-transparent text-gray-700'
                    }`}
                  >
                    Tous les agents
                  </button>
                  <button
                    onClick={() => setActiveFilter('nouveaux')}
                    className={`px-6 py-2 text-sm font-medium ${
                      activeFilter === 'nouveaux' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-transparent text-gray-700'
                    }`}
                  >
                    Nouveaux agents
                  </button>
                </div>
                
                {/* Barre de recherche */}
                <div className="relative rounded-full shadow-sm">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Rechercher un agent"
                    className="pl-4 pr-10 py-2 w-64 rounded-full bg-white border border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Agents Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-base font-medium text-gray-800">Nom(s)</th>
                    <th className="px-6 py-4 text-left text-base font-medium text-gray-800">Prenom(s)</th>
                    <th className="px-6 py-4 text-left text-base font-medium text-gray-800">Email</th>
                    <th className="px-6 py-4 text-left text-base font-medium text-gray-800">Téléphone</th>
                    <th className="px-6 py-4 text-left text-base font-medium text-gray-800">Services</th>
                    <th className="px-6 py-4 text-left text-base font-medium text-gray-800">Rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentAgents.length > 0 ? (
                    currentAgents.map((agent, index) => (
                      <tr 
                        key={agent._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 uppercase">{agent.nom || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{agent.prenom || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{agent.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{agent.telephone || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {agent.servicesAffecte && agent.servicesAffecte.length > 0
                              ? agent.servicesAffecte[0]?.nomService || "Aucun service"
                              : "Aucun service"
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{agent.role || ''}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        {gerants && gerants.length === 0 ? "Aucun agent trouvé" : "Chargement..."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination footer */}
            <div className="flex justify-between items-center py-4 px-6 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Liste complète des agents
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-16 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-12 h-12 flex items-center justify-center rounded-lg ${
                        currentPage === pageNum
                          ? "bg-orange-500 text-white"
                          : pageNum === 5 
                            ? "text-blue-500 border border-blue-500" 
                            : "text-gray-700 border border-gray-200 hover:bg-gray-50"
                      } ${i === 0 ? '' : 'border-l-0'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-16 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GerantsView;