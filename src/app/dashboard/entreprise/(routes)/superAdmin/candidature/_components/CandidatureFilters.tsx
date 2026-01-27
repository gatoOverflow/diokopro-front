"use client";

import React from 'react';
import {
  Search,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  ArrowUpDown,
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

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

interface CandidatureFiltersProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  counts: {
    all: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  filteredCount: number;
}

const CandidatureFilters: React.FC<CandidatureFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  searchValue,
  onSearchChange,
  counts,
  filteredCount
}) => {
  const statusTabs = [
    {
      value: 'all' as StatusFilter,
      label: 'Toutes',
      icon: Building2,
      count: counts.all,
      bgActive: 'bg-[#0cadec]/10 border-[#0cadec] text-[#0cadec]'
    },
    {
      value: 'pending' as StatusFilter,
      label: 'En attente',
      icon: Clock,
      count: counts.pending,
      color: 'text-amber-500',
      bgActive: 'bg-amber-50 border-amber-400 text-amber-700'
    },
    {
      value: 'accepted' as StatusFilter,
      label: 'Acceptées',
      icon: CheckCircle2,
      count: counts.accepted,
      color: 'text-emerald-500',
      bgActive: 'bg-emerald-50 border-emerald-400 text-emerald-700'
    },
    {
      value: 'rejected' as StatusFilter,
      label: 'Refusées',
      icon: XCircle,
      count: counts.rejected,
      color: 'text-red-500',
      bgActive: 'bg-red-50 border-red-400 text-red-700'
    }
  ];

  const hasActiveFilters = searchValue || statusFilter !== 'all' || sortBy !== 'date';

  const handleReset = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onSortByChange('date');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher par nom, NINEA, RCCM ou représentant..."
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

      {/* Tabs + Sort + Results */}
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
                    ? tab.bgActive
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : tab.color || 'text-gray-400'}`} />
                <span>{tab.label}</span>
                <Badge
                  variant="secondary"
                  className={`ml-1 text-xs px-2 py-0 h-5 ${
                    isActive
                      ? tab.value === 'all'
                        ? 'bg-[#0cadec]/20 text-[#0cadec]'
                        : 'bg-white/50'
                      : 'bg-gray-100'
                  }`}
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Sort + Results + Reset */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-44 h-10 bg-white border-gray-300 rounded-xl focus:border-[#0cadec] focus:ring-[#0cadec]/30">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Date (récent)
                  </span>
                </SelectItem>
                <SelectItem value="date-asc">Date (ancien)</SelectItem>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-lg border border-gray-300">
            <span className="font-semibold text-gray-900">{filteredCount}</span>
            {filteredCount !== counts.all && (
              <span className="text-gray-400"> / {counts.all}</span>
            )}{' '}
            <span className="text-gray-500">candidature{filteredCount > 1 ? 's' : ''}</span>
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

export default CandidatureFilters;
