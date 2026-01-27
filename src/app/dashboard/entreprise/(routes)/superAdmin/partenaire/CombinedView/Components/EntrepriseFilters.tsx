"use client";

import React from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  LayoutGrid,
  List,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  SlidersHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface EntrepriseFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalCount?: number;
  filteredCount?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const EntrepriseFilters: React.FC<EntrepriseFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  totalCount = 0,
  filteredCount = 0,
  searchValue = '',
  onSearchChange,
}) => {
  // Status tabs configuration
  const statusTabs = [
    {
      value: 'all',
      label: 'Tous',
      icon: Building2,
      count: totalCount
    },
    {
      value: 'active',
      label: 'Actifs',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgActive: 'bg-green-50 border-green-400 text-green-700'
    },
    {
      value: 'inactive',
      label: 'Inactifs',
      icon: XCircle,
      color: 'text-red-500',
      bgActive: 'bg-red-50 border-red-400 text-red-700'
    },
    {
      value: 'pending',
      label: 'En attente',
      icon: Clock,
      color: 'text-amber-500',
      bgActive: 'bg-amber-50 border-amber-400 text-amber-700'
    },
  ];

  // Check if any filter is active
  const hasActiveFilters = searchValue || statusFilter !== 'all' || sortBy !== 'name';

  // Reset all filters
  const handleReset = () => {
    onSearchChange?.('');
    onStatusFilterChange('all');
    onSortByChange('name');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Row 1: Search + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar - Full width on mobile */}
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une entreprise par nom, email ou adresse..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-10 h-12 w-full bg-white border-gray-300 rounded-xl text-base focus:border-[#0cadec] focus:ring-[#0cadec]/30 shadow-sm"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-300">
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 px-4 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-[#0cadec] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Grille</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 px-4 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-[#0cadec] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Row 2: Status Tabs + Sort + Results */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => onStatusFilterChange(tab.value)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
                  whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? tab.bgActive || 'bg-[#0cadec]/10 border-[#0cadec] text-[#0cadec]'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : tab.color || 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {tab.value === 'all' && (
                  <Badge
                    variant="secondary"
                    className={`ml-1 text-xs px-2 py-0 h-5 ${
                      isActive ? 'bg-[#0cadec]/20 text-[#0cadec]' : 'bg-gray-100'
                    }`}
                  >
                    {totalCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Sort + Results + Reset */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-44 h-10 bg-white border-gray-300 rounded-xl focus:border-[#0cadec] focus:ring-[#0cadec]/30">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Nom (A-Z)
                  </span>
                </SelectItem>
                <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                <SelectItem value="date">Date (récent)</SelectItem>
                <SelectItem value="date-asc">Date (ancien)</SelectItem>
                <SelectItem value="solde">Solde (élevé)</SelectItem>
                <SelectItem value="solde-asc">Solde (bas)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-lg border border-gray-300">
            <span className="font-semibold text-gray-900">{filteredCount}</span>
            {filteredCount !== totalCount && (
              <span className="text-gray-400"> / {totalCount}</span>
            )}{' '}
            <span className="text-gray-500">entreprise{filteredCount > 1 ? 's' : ''}</span>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-10 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntrepriseFilters;
