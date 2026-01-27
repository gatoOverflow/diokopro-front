"use client";

import React from 'react';
import { Building2, Mail, MapPin, Users, Phone, ExternalLink, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface EntrepriseCardProps {
  entreprise: {
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
  };
  isActive: boolean;
  isUpdating: boolean;
  onToggleStatus: (id: string, event: React.MouseEvent) => void;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
}

const EntrepriseCard: React.FC<EntrepriseCardProps> = ({
  entreprise,
  isActive,
  isUpdating,
  onToggleStatus,
  onClick,
  viewMode = 'grid',
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatSolde = (solde: number) => {
    return new Intl.NumberFormat('fr-FR').format(solde);
  };

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div
        className="group bg-white rounded-xl border border-gray-100 hover:border-[#0cadec]/30 hover:shadow-xl hover:shadow-[#0cadec]/5 transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={onClick}
      >
        {/* Top accent bar */}
        <div className={`h-1 ${isActive ? 'bg-gradient-to-r from-[#0cadec] to-[#0a8bc7]' : 'bg-gray-200'}`} />

        <div className="p-5">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-[#0cadec]/20">
                <AvatarImage src={entreprise.logo} alt={entreprise.nomEntreprise} />
                <AvatarFallback className="bg-gradient-to-br from-[#0cadec] to-[#0a8bc7] text-white font-semibold">
                  {getInitials(entreprise.nomEntreprise || 'EN')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#0cadec] transition-colors">
                  {entreprise.nomEntreprise}
                </h3>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={`mt-1 text-xs ${
                    isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Désactiver
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {entreprise.emailEntreprise && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{entreprise.emailEntreprise}</span>
              </div>
            )}
            {entreprise.adresse && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{entreprise.adresse}</span>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-[#0cadec]" />
              <span className="font-medium text-gray-900">
                {entreprise.stats?.agents || 0}
              </span>
              <span className="text-gray-500">agents</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-gray-900">
                {entreprise.stats?.clients || 0}
              </span>
              <span className="text-gray-500">clients</span>
            </div>
          </div>

          {/* Footer with Switch */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {entreprise.solde !== undefined && (
              <div className="text-sm">
                <span className="text-gray-500">Solde: </span>
                <span className="font-semibold text-gray-900">
                  {formatSolde(entreprise.solde)} FCFA
                </span>
              </div>
            )}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-gray-500">
                {isActive ? 'Actif' : 'Inactif'}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={() => onToggleStatus(entreprise._id, {} as React.MouseEvent)}
                disabled={isUpdating}
                className="data-[state=checked]:bg-[#0cadec]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className="group bg-white rounded-xl border border-gray-100 hover:border-[#0cadec]/30 hover:shadow-lg transition-all duration-300 cursor-pointer p-4"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="w-14 h-14 ring-2 ring-offset-2 ring-[#0cadec]/20 flex-shrink-0">
          <AvatarImage src={entreprise.logo} alt={entreprise.nomEntreprise} />
          <AvatarFallback className="bg-gradient-to-br from-[#0cadec] to-[#0a8bc7] text-white font-semibold text-lg">
            {getInitials(entreprise.nomEntreprise || 'EN')}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#0cadec] transition-colors">
              {entreprise.nomEntreprise}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {entreprise.emailEntreprise}
            </p>
          </div>

          <div className="hidden md:block">
            <p className="text-sm text-gray-500 truncate flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {entreprise.adresse || 'Non renseigné'}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm">
              <span className="font-medium">{entreprise.stats?.agents || 0}</span>{' '}
              <span className="text-gray-500">agents</span>
            </span>
            <span className="text-sm">
              <span className="font-medium">{entreprise.stats?.clients || 0}</span>{' '}
              <span className="text-gray-500">clients</span>
            </span>
          </div>

          <div className="hidden md:block text-right">
            {entreprise.solde !== undefined && (
              <p className="font-semibold text-gray-900">
                {formatSolde(entreprise.solde)} FCFA
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={`flex-shrink-0 ${
            isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isActive ? 'Actif' : 'Inactif'}
        </Badge>

        {/* Switch */}
        <div
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={isActive}
            onCheckedChange={() => onToggleStatus(entreprise._id, {} as React.MouseEvent)}
            disabled={isUpdating}
            className="data-[state=checked]:bg-[#0cadec]"
          />
        </div>
      </div>
    </div>
  );
};

export default EntrepriseCard;
