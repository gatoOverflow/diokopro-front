"use client";

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { toggleEntrepriseStatus } from '@/actions/acceptEntreprise';

// New Components
import BalanceCard from './Components/BalanceCard';
import MetricsCardsNew from './Components/MetricsCardsNew';
import EntrepriseFilters from './Components/EntrepriseFilters';
import EntrepriseGrid from './Components/EntrepriseGrid';
import EntrepriseDetailsDialog from './Components/EntrepriseDetailsDialog';

interface CombinedViewProps {
  services?: any[];
  serviceId?: string;
  balance?: number;
  nombreTotalGerants?: number;
  termeRecherche?: string;
  clients?: any[];
  agentsResponse?: number;
  gerantsResponse?: number;
  clientsResponse?: number;
  agentNotTopayer?: any[];
  getNumbersEntreprise?: number;
  agentapayer?: any[];
  agents?: any[]; // This is actually entreprises
  gerants?: any[];
  clientNotTopayer?: any[];
  entrepriseId?: string;
  nomEntreprise?: string;
}

const CombinedViewTest: React.FC<CombinedViewProps> = ({
  services,
  balance = 0,
  clients,
  agentsResponse = 0,
  gerantsResponse = 0,
  clientsResponse = 0,
  getNumbersEntreprise = 0,
  agents = [], // entreprises
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEntreprise, setSelectedEntreprise] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleEntrepriseClick = useCallback((entreprise: any) => {
    setSelectedEntreprise(entreprise);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedEntreprise(null);
  }, []);

  const handleToggleStatus = useCallback(async (id: string, newStatus: boolean) => {
    try {
      const result = await toggleEntrepriseStatus(id, newStatus);

      if (result.type === 'error') {
        toast.error(result.error || 'Erreur lors de la mise à jour');
        throw new Error(result.error);
      }

      toast.success(
        newStatus
          ? 'Entreprise activée avec succès'
          : 'Entreprise désactivée avec succès'
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      throw error;
    }
  }, []);

  // Calculate active count
  const activeCount = agents.filter((ent) => ent.estActif).length;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <BalanceCard
          totalSolde={balance}
          trend={{
            value: 12,
            isPositive: true,
            label: 'ce mois',
          }}
          subtitle="Solde total des partenaires"
        />

        {/* Metrics Cards */}
        <MetricsCardsNew
          entrepriseCount={getNumbersEntreprise || agents.length}
          agentsCount={agentsResponse}
          clientsCount={clientsResponse}
          activeCount={activeCount}
        />

        {/* Filters */}
        <EntrepriseFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={agents.length}
          filteredCount={agents.length}
          searchValue={searchTerm}
          onSearchChange={handleSearch}
        />

        {/* Entreprise Grid */}
        <EntrepriseGrid
          entreprises={agents}
          viewMode={viewMode}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          sortBy={sortBy}
          onEntrepriseClick={handleEntrepriseClick}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />

        {/* Details Dialog */}
        <EntrepriseDetailsDialog
          entreprise={selectedEntreprise}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      </div>
    </div>
  );
};

export default CombinedViewTest;
