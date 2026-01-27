"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { refuseEntreprise, updateEntrepriseStatus } from '@/actions/acceptEntreprise';
import { InterfaceEntreprise } from '../../../_models/entreprise.model';

// Components
import CandidatureMetrics from './CandidatureMetrics';
import CandidatureFilters from './CandidatureFilters';
import CandidatureGrid from './CandidatureGrid';
import CandidatureDetailsModal from './CandidatureDetailsModal';
import ConfirmationModal from './ConfirmationModal';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

interface CandidatureViewProps {
  entreprises: InterfaceEntreprise[];
}

const CandidatureView: React.FC<CandidatureViewProps> = ({ entreprises = [] }) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedEntreprise, setSelectedEntreprise] = useState<InterfaceEntreprise | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'accept' | 'reject' | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Calculate counts
  const counts = useMemo(() => {
    const pending = entreprises.filter((e) => !e.estActif && !e.raisonRefus).length;
    const accepted = entreprises.filter((e) => e.estActif).length;
    const rejected = entreprises.filter((e) => !e.estActif && e.raisonRefus).length;

    return {
      all: entreprises.length,
      pending,
      accepted,
      rejected
    };
  }, [entreprises]);

  // Calculate filtered count
  const filteredCount = useMemo(() => {
    let result = [...entreprises];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((ent) => {
        if (statusFilter === 'pending') return !ent.estActif && !ent.raisonRefus;
        if (statusFilter === 'accepted') return ent.estActif;
        if (statusFilter === 'rejected') return !ent.estActif && ent.raisonRefus;
        return true;
      });
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((ent) =>
        ent.nomEntreprise?.toLowerCase().includes(term) ||
        ent.ninea?.toLowerCase().includes(term) ||
        ent.rccm?.toLowerCase().includes(term) ||
        ent.representéPar?.toLowerCase().includes(term)
      );
    }

    return result.length;
  }, [entreprises, statusFilter, searchTerm]);

  // Calculate taux d'acceptation
  const tauxAcceptation = useMemo(() => {
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
          // Reload to refresh data
          setTimeout(() => window.location.reload(), 1000);
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
          // Reload to refresh data
          setTimeout(() => window.location.reload(), 1000);
        } else {
          throw new Error(result.error || 'Erreur lors du refus');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
      throw error;
    }
  }, [selectedEntreprise, confirmationType]);

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
          filteredCount={filteredCount}
        />

        {/* Grid */}
        <CandidatureGrid
          entreprises={entreprises}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          sortBy={sortBy}
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
