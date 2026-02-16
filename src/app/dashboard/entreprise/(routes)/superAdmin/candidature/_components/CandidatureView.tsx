"use client";

import React, { useState, useCallback, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { refuseEntreprise, updateEntrepriseStatus } from '@/actions/acceptEntreprise';
import { getCandidaturesPaginated } from '@/actions/superAdminActions';
import { InterfaceEntreprise } from '../../../_models/entreprise.model';

// Components
import CandidatureMetrics from './CandidatureMetrics';
import CandidatureFilters from './CandidatureFilters';
import CandidatureGrid from './CandidatureGrid';
import CandidatureDetailsModal from './CandidatureDetailsModal';
import ConfirmationModal from './ConfirmationModal';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

interface CandidatureViewProps {
  initialCandidatures?: InterfaceEntreprise[];
  initialCounts?: {
    all: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CandidatureView: React.FC<CandidatureViewProps> = ({
  initialCandidatures = [],
  initialCounts,
  initialPagination,
}) => {
  // State
  const [isPending, startTransition] = useTransition();
  const [candidatures, setCandidatures] = useState(initialCandidatures);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedEntreprise, setSelectedEntreprise] = useState<InterfaceEntreprise | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'accept' | 'reject' | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [pagination, setPagination] = useState(initialPagination || {
    page: 1,
    limit: 9,
    total: initialCandidatures.length,
    totalPages: Math.ceil(initialCandidatures.length / 9),
  });

  // Counts state
  const [counts, setCounts] = useState(initialCounts || {
    all: initialCandidatures.length,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch candidatures from server
  const fetchCandidatures = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await getCandidaturesPaginated({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        status: statusFilter,
        sort: sortBy,
      });

      if (result.type === 'error') {
        toast.error(result.error || 'Erreur lors du chargement');
        return;
      }

      setCandidatures(result.data);
      setCounts(result.counts);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching candidatures:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, sortBy]);

  // Track if we've fetched data at least once (to skip only the very first render)
  const [hasFetched, setHasFetched] = React.useState(false);

  // Fetch when filters change
  useEffect(() => {
    // Skip ONLY the initial fetch if we have initial data and haven't fetched yet
    if (!hasFetched && initialCandidatures.length > 0 && currentPage === 1 && !debouncedSearch && statusFilter === 'all' && sortBy === 'date') {
      setHasFetched(true);
      return;
    }

    setHasFetched(true);
    startTransition(() => {
      fetchCandidatures();
    });
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sortBy, itemsPerPage]);

  // Calculate taux d'acceptation
  const tauxAcceptation = React.useMemo(() => {
    const total = counts.accepted + counts.rejected;
    if (total === 0) return 0;
    return Math.round((counts.accepted / total) * 100);
  }, [counts]);

  // Handlers
  const handleEntrepriseClick = useCallback((entreprise: InterfaceEntreprise) => {
    setSelectedEntreprise(entreprise);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedEntreprise(null);
  }, []);

  const handleAcceptClick = useCallback((entreprise: InterfaceEntreprise) => {
    setSelectedEntreprise(entreprise);
    setConfirmationType('accept');
    setIsConfirmOpen(true);
  }, []);

  const handleRejectClick = useCallback((entreprise: InterfaceEntreprise) => {
    setSelectedEntreprise(entreprise);
    setConfirmationType('reject');
    setIsConfirmOpen(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setConfirmationType(null);
  }, []);

  const handleConfirmAction = useCallback(async (reason?: string) => {
    if (!selectedEntreprise || !confirmationType) return;

    try {
      if (confirmationType === 'accept') {
        const result = await updateEntrepriseStatus({
          entrepriseId: selectedEntreprise._id,
          estActif: true
        });

        if (result.type === 'success') {
          toast.success(`${selectedEntreprise.nomEntreprise} a été acceptée avec succès`);
          // Refresh data
          fetchCandidatures();
          handleCloseConfirm();
        } else {
          throw new Error(result.error || 'Erreur lors de l\'acceptation');
        }
      } else {
        if (!reason) throw new Error('Raison requise');

        const result = await refuseEntreprise({
          entrepriseId: selectedEntreprise._id,
          raisonRefus: reason
        });

        if (result.type === 'success') {
          toast.success(`${selectedEntreprise.nomEntreprise} a été refusée`);
          // Refresh data
          fetchCandidatures();
          handleCloseConfirm();
        } else {
          throw new Error(result.error || 'Erreur lors du refus');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
      throw error;
    }
  }, [selectedEntreprise, confirmationType, fetchCandidatures]);

  // Accept/Reject from details modal
  const handleAcceptFromDetails = useCallback(() => {
    if (selectedEntreprise) {
      setIsDetailsOpen(false);
      setConfirmationType('accept');
      setIsConfirmOpen(true);
    }
  }, [selectedEntreprise]);

  const handleRejectFromDetails = useCallback(() => {
    if (selectedEntreprise) {
      setIsDetailsOpen(false);
      setConfirmationType('reject');
      setIsConfirmOpen(true);
    }
  }, [selectedEntreprise]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchCandidatures();
  }, [fetchCandidatures]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics */}
        <CandidatureMetrics
          totalPostulants={counts.pending}
          totalAcceptes={counts.accepted}
          totalRefuses={counts.rejected}
          tauxAcceptation={tauxAcceptation}
        />

        {/* Filters */}
        <CandidatureFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          counts={counts}
          filteredCount={pagination.total}
          onRefresh={handleRefresh}
          isRefreshing={isLoading || isPending}
        />

        {/* Grid with Server-Side Pagination */}
        <CandidatureGrid
          candidatures={candidatures}
          isLoading={isLoading || isPending}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onEntrepriseClick={handleEntrepriseClick}
          onAccept={handleAcceptClick}
          onReject={handleRejectClick}
        />

        {/* Details Modal */}
        <CandidatureDetailsModal
          entreprise={selectedEntreprise}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onAccept={handleAcceptFromDetails}
          onReject={handleRejectFromDetails}
        />

        {/* Confirmation Modal */}
        {selectedEntreprise && confirmationType && (
          <ConfirmationModal
            isOpen={isConfirmOpen}
            onClose={handleCloseConfirm}
            onConfirm={handleConfirmAction}
            type={confirmationType}
            entrepriseName={selectedEntreprise.nomEntreprise}
          />
        )}
      </div>
    </div>
  );
};

export default CandidatureView;
