"use client";

import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CandidatureCard from './CandidatureCard';
import { InterfaceEntreprise } from '../../../_models/entreprise.model';

type CandidatureStatus = 'pending' | 'accepted' | 'rejected';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CandidatureGridProps {
  candidatures: InterfaceEntreprise[];
  isLoading?: boolean;
  pagination: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEntrepriseClick: (entreprise: InterfaceEntreprise) => void;
  onAccept: (entreprise: InterfaceEntreprise) => void;
  onReject: (entreprise: InterfaceEntreprise) => void;
}

const CandidatureGrid: React.FC<CandidatureGridProps> = ({
  candidatures,
  isLoading = false,
  pagination,
  currentPage,
  onPageChange,
  onEntrepriseClick,
  onAccept,
  onReject
}) => {
  // Determine status of an entreprise
  const getEntrepriseStatus = (entreprise: InterfaceEntreprise): CandidatureStatus => {
    // Use candidatureStatus if available from backend
    if ((entreprise as any).candidatureStatus) {
      return (entreprise as any).candidatureStatus;
    }
    // Fallback to computed status
    if (entreprise.estActif) return 'accepted';
    if (entreprise.raisonRefus) return 'rejected';
    return 'pending';
  };

  // Loading skeleton
  if (isLoading && candidatures.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && candidatures.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-300 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune candidature trouvée
        </h3>
        <p className="text-gray-500">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid with loading overlay */}
      <div className={`relative ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidatures.map((entreprise) => (
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
      </div>

      {/* Server-Side Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
            className="border-gray-300 rounded-xl"
          >
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
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
            onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages || isLoading}
            className="border-gray-300 rounded-xl"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination.total > 0 && (
        <div className="text-center text-sm text-gray-500">
          Affichage de {((currentPage - 1) * pagination.limit) + 1} à {Math.min(currentPage * pagination.limit, pagination.total)} sur {pagination.total} candidatures
        </div>
      )}
    </div>
  );
};

export default CandidatureGrid;
