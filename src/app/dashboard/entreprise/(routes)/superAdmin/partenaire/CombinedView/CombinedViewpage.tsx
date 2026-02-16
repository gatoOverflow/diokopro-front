"use client";

import React, { useState, useCallback, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { toggleEntrepriseStatus } from '@/actions/acceptEntreprise';
import { getEntreprisesPaginated } from '@/actions/superAdminActions';

// Components
import BalanceCard from './Components/BalanceCard';
import MetricsCardsNew from './Components/MetricsCardsNew';
import EntrepriseFilters from './Components/EntrepriseFilters';
import EntrepriseGrid from './Components/EntrepriseGrid';
import EntrepriseDetailsDialog from './Components/EntrepriseDetailsDialog';

interface CombinedViewProps {
  balance?: number;
  agentsResponse?: number;
  clientsResponse?: number;
  getNumbersEntreprise?: number;
  agents?: any[]; // Initial entreprises (first page)
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CombinedViewTest: React.FC<CombinedViewProps> = ({
  balance = 0,
  agentsResponse = 0,
  clientsResponse = 0,
  getNumbersEntreprise = 0,
  agents = [], // Initial data
  initialPagination,
}) => {
  // State
  const [isPending, startTransition] = useTransition();
  const [entreprises, setEntreprises] = useState(agents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEntreprise, setSelectedEntreprise] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [pagination, setPagination] = useState(initialPagination || {
    page: 1,
    limit: 12,
    total: agents.length,
    totalPages: Math.ceil(agents.length / 12),
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch entreprises from server
  const fetchEntreprises = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await getEntreprisesPaginated({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortBy,
        order: sortOrder,
      });

      if (result.type === 'error') {
        toast.error(result.error || 'Erreur lors du chargement');
        return;
      }

      setEntreprises(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      toast.error('Erreur lors du chargement des entreprises');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

  // Track if we've fetched data at least once (to skip only the very first render)
  const [hasFetched, setHasFetched] = React.useState(false);

  // Fetch when filters change
  useEffect(() => {
    // Skip ONLY the initial fetch if we have initial data and haven't fetched yet
    if (!hasFetched && agents.length > 0 && currentPage === 1 && !debouncedSearch && statusFilter === 'all' && sortBy === 'createdAt') {
      setHasFetched(true);
      return;
    }

    setHasFetched(true);
    startTransition(() => {
      fetchEntreprises();
    });
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, itemsPerPage]);

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

  const handleEntrepriseUpdated = useCallback((updatedEntreprise: any) => {
    // Update in local list
    setEntreprises(prev =>
      prev.map(ent =>
        ent._id === updatedEntreprise._id ? { ...ent, ...updatedEntreprise } : ent
      )
    );
    setSelectedEntreprise(updatedEntreprise);
  }, []);

  const handleToggleStatus = useCallback(async (id: string, newStatus: boolean) => {
    try {
      const result = await toggleEntrepriseStatus(id, newStatus);

      if (result.type === 'error') {
        toast.error(result.error || 'Erreur lors de la mise à jour');
        throw new Error(result.error);
      }

      // Update local state
      setEntreprises(prev =>
        prev.map(ent =>
          ent._id === id ? { ...ent, estActif: newStatus } : ent
        )
      );

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

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchEntreprises();
  }, [fetchEntreprises]);

  // Calculate active count from current page
  const activeCount = entreprises.filter((ent) => ent.estActif).length;

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
          entrepriseCount={pagination.total || getNumbersEntreprise}
          agentsCount={agentsResponse}
          clientsCount={clientsResponse}
          activeCount={activeCount}
        />

        {/* Filters */}
        <EntrepriseFilters
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={pagination.total}
          filteredCount={entreprises.length}
          searchValue={searchTerm}
          onSearchChange={handleSearch}
          onRefresh={handleRefresh}
          isRefreshing={isLoading || isPending}
        />

        {/* Entreprise Grid with Server-Side Pagination */}
        <EntrepriseGrid
          entreprises={entreprises}
          viewMode={viewMode}
          onEntrepriseClick={handleEntrepriseClick}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading || isPending}
          // Server-side pagination props
          pagination={pagination}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        {/* Details Dialog */}
        <EntrepriseDetailsDialog
          entreprise={selectedEntreprise}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onEntrepriseUpdated={handleEntrepriseUpdated}
        />
      </div>
    </div>
  );
};

export default CombinedViewTest;
