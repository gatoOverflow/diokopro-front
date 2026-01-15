"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Search, AlertCircle } from 'lucide-react';
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

interface EntrepriseGridProps {
  entreprises: Entreprise[];
  viewMode: 'grid' | 'list';
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  onEntrepriseClick: (entreprise: Entreprise) => void;
  onToggleStatus: (id: string, newStatus: boolean) => Promise<void>;
  isLoading?: boolean;
}

const EntrepriseGrid: React.FC<EntrepriseGridProps> = ({
  entreprises = [],
  viewMode,
  searchTerm,
  statusFilter,
  sortBy,
  onEntrepriseClick,
  onToggleStatus,
  isLoading = false,
}) => {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [updatingStates, setUpdatingStates] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filter and sort entreprises
  const filteredEntreprises = useMemo(() => {
    let filtered = [...entreprises];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ent) =>
          ent.nomEntreprise?.toLowerCase().includes(search) ||
          ent.emailEntreprise?.toLowerCase().includes(search) ||
          ent.adresse?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ent) => {
        const isActive = activeStates[ent._id] ?? ent.estActif;
        if (statusFilter === 'active') return isActive;
        if (statusFilter === 'inactive') return !isActive;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.nomEntreprise || '').localeCompare(b.nomEntreprise || '');
        case 'name-desc':
          return (b.nomEntreprise || '').localeCompare(a.nomEntreprise || '');
        case 'date':
          return new Date(b.dateCreation || 0).getTime() - new Date(a.dateCreation || 0).getTime();
        case 'date-asc':
          return new Date(a.dateCreation || 0).getTime() - new Date(b.dateCreation || 0).getTime();
        case 'solde':
          return (b.solde || 0) - (a.solde || 0);
        case 'solde-asc':
          return (a.solde || 0) - (b.solde || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [entreprises, searchTerm, statusFilter, sortBy, activeStates]);

  // Pagination
  const totalPages = Math.ceil(filteredEntreprises.length / itemsPerPage);
  const paginatedEntreprises = filteredEntreprises.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
  if (isLoading) {
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
  if (filteredEntreprises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {searchTerm ? (
            <Search className="w-10 h-10 text-gray-400" />
          ) : (
            <Building2 className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchTerm ? 'Aucun résultat trouvé' : 'Aucune entreprise'}
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          {searchTerm
            ? `Aucune entreprise ne correspond à "${searchTerm}". Essayez avec d'autres termes.`
            : 'Il n\'y a pas encore d\'entreprises partenaires.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid/List */}
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-3'
      }>
        {paginatedEntreprises.map((entreprise) => (
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

      {/* Pagination */}
      <PaginationNew
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredEntreprises.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default EntrepriseGrid;
