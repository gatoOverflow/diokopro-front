"use client";

import React from 'react';
import { Search, Plus, Building2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  showAction?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  actionLabel = 'Nouveau',
  onActionClick,
  showAction = true,
}) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              <span
                className={`${
                  index === breadcrumbs.length - 1
                    ? 'text-[#0cadec] font-medium'
                    : 'hover:text-gray-700 cursor-pointer'
                }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0cadec]/10 rounded-xl">
            <Building2 className="w-6 h-6 text-[#0cadec]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full sm:w-72 h-10 border-gray-200 focus:border-[#0cadec] focus:ring-[#0cadec]/20"
              />
            </div>
          )}

          {/* Action Button */}
          {showAction && onActionClick && (
            <Button
              onClick={onActionClick}
              className="bg-[#0cadec] hover:bg-[#0cadec]/90 text-white h-10 px-4 shadow-lg shadow-[#0cadec]/25 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
