"use client";

import React, { useMemo, useState } from 'react';
import { Building2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CandidatureCard from './CandidatureCard';
import { InterfaceEntreprise } from '../../../_models/entreprise.model';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';
type CandidatureStatus = 'pending' | 'accepted' | 'rejected';

interface CandidatureGridProps {
  entreprises: InterfaceEntreprise[];
  searchTerm: string;
  statusFilter: StatusFilter;
  sortBy: string;
  onEntrepriseClick: (entreprise: InterfaceEntreprise) => void;
  onAccept: (entreprise: InterfaceEntreprise) => void;
  onReject: (entreprise: InterfaceEntreprise) => void;
}

const ITEMS_PER_PAGE = 9;

const CandidatureGrid: React.FC<CandidatureGridProps> = ({
  entreprises,
  searchTerm,
  statusFilter,
  sortBy,
  onEntrepriseClick,
  onAccept,
  onReject
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Determine status of an entreprise
  const getEntrepriseStatus = (entreprise: InterfaceEntreprise): CandidatureStatus => {
    // If estActif is true, it's accepted
    if (entreprise.estActif) return 'accepted';
    // If there's a rejection reason, it's rejected
    if (entreprise.raisonRefus) return 'rejected';
    // Otherwise, it's pending
    return 'pending';
  };

  // Filter and sort entreprises
  const filteredEntreprises = useMemo(() => {
    let result = [...entreprises];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((ent) => {
        const status = getEntrepriseStatus(ent);
        return status === statusFilter;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((ent) =>
        ent.nomEntreprise?.toLowerCase().includes(term) ||
        ent.ninea?.toLowerCase().includes(term) ||
        ent.rccm?.toLowerCase().includes(term) ||
        ent.representéPar?.toLowerCase().includes(term) ||
        ent.emailEntreprise?.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nomEntreprise.localeCompare(b.nomEntreprise);
        case 'name-desc':
          return b.nomEntreprise.localeCompare(a.nomEntreprise);
        case 'date':
          return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
        case 'date-asc':
          return new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [entreprises, statusFilter, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredEntreprises.length / ITEMS_PER_PAGE);
  const paginatedEntreprises = filteredEntreprises.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Empty state
  if (filteredEntreprises.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-300 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune candidature trouvée
        </h3>
        <p className="text-gray-500">
          {searchTerm
            ? 'Essayez de modifier vos critères de recherche'
            : statusFilter !== 'all'
              ? `Aucune candidature ${statusFilter === 'pending' ? 'en attente' : statusFilter === 'accepted' ? 'acceptée' : 'refusée'}`
              : 'Aucune candidature pour le moment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedEntreprises.map((entreprise) => (
          <CandidatureCard
            key={entreprise._id}
            entreprise={entreprise}
            status={getEntrepriseStatus(entreprise)}
            onClick={() => onEntrepriseClick(entreprise)}
            onAccept={(e) => {
              e.stopPropagation();
              onAccept(entreprise);
            }}
            onReject={(e) => {
              e.stopPropagation();
              onReject(entreprise);
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-gray-300 rounded-xl"
          >
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl ${
                      currentPage === page
                        ? 'bg-[#0cadec] hover:bg-[#0cadec]/90'
                        : 'border-gray-300'
                    }`}
                  >
                    {page}
                  </Button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-gray-300 rounded-xl"
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};

export default CandidatureGrid;
