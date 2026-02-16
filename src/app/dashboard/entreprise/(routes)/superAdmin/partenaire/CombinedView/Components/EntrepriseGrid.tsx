"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Search } from 'lucide-react';
import EntrepriseCard from './EntrepriseCard';
import PaginationNew from './PaginationNew';
import { Skeleton } from '@/components/ui/skeleton';

interface Entreprise {
  _id: string;
  nomEntreprise: string;
  logo?: string;
  emailEntreprise?: string;
  telephoneEntreprise?: string;
  adresse?: string;
  estActif: boolean;
  solde?: number;
  stats?: {
    agents?: number;
    clients?: number;
  };
  dateCreation?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

interface EntrepriseGridProps {
  entreprises: Entreprise[];
  viewMode: 'grid' | 'list';
  onEntrepriseClick: (entreprise: Entreprise) => void;
  onToggleStatus: (id: string, newStatus: boolean) => Promise<void>;
  isLoading?: boolean;
  // Server-side pagination props
  pagination: Pagination;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

const EntrepriseGrid: React.FC<EntrepriseGridProps> = ({
  entreprises = [],
  viewMode,
  onEntrepriseClick,
  onToggleStatus,
  isLoading = false,
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [updatingStates, setUpdatingStates] = useState<Record<string, boolean>>({});

  // Initialize active states from entreprises data
  useEffect(() => {
    if (entreprises.length > 0) {
      const initialStates = entreprises.reduce((acc, ent) => {
        acc[ent._id] = ent.estActif || false;
        return acc;
      }, {} as Record<string, boolean>);
      setActiveStates(initialStates);
    }
  }, [entreprises]);

  // Handle toggle status
  const handleToggleStatus = async (id: string, event: React.MouseEvent) => {
    event?.stopPropagation?.();

    const newStatus = !activeStates[id];

    // Optimistic update
    setActiveStates((prev) => ({ ...prev, [id]: newStatus }));
    setUpdatingStates((prev) => ({ ...prev, [id]: true }));

    try {
      await onToggleStatus(id, newStatus);
    } catch (error) {
      // Revert on error
      setActiveStates((prev) => ({ ...prev, [id]: !newStatus }));
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Loading skeleton
  if (isLoading && entreprises.length === 0) {
    return (
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-3'
      }>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && entreprises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Aucune entreprise ne correspond à vos critères de recherche.
          Essayez de modifier vos filtres.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid/List with loading overlay */}
      <div className={`relative ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {entreprises.map((entreprise) => (
            <EntrepriseCard
              key={entreprise._id}
              entreprise={entreprise}
              isActive={activeStates[entreprise._id] ?? entreprise.estActif}
              isUpdating={updatingStates[entreprise._id] || false}
              onToggleStatus={handleToggleStatus}
              onClick={() => onEntrepriseClick(entreprise)}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>

      {/* Server-Side Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationNew
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default EntrepriseGrid;
