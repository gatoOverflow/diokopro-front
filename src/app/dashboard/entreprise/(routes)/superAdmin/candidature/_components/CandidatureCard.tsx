"use client";

import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InterfaceEntreprise } from '../../../_models/entreprise.model';

type CandidatureStatus = 'pending' | 'accepted' | 'rejected';

interface CandidatureCardProps {
  entreprise: InterfaceEntreprise;
  status: CandidatureStatus;
  onClick: () => void;
  onAccept?: (e: React.MouseEvent) => void;
  onReject?: (e: React.MouseEvent) => void;
}

const CandidatureCard: React.FC<CandidatureCardProps> = ({
  entreprise,
  status,
  onClick,
  onAccept,
  onReject
}) => {
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'EN';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Acceptée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-300 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Refusée
          </Badge>
        );
    }
  };

  const getAvatarColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-300 p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-[#0cadec]/50 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className={`w-12 h-12 ${getAvatarColor()}`}>
            <AvatarFallback className={getAvatarColor()}>
              {getInitials(entreprise.nomEntreprise)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#0cadec] transition-colors">
              {entreprise.nomEntreprise}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              {entreprise.representéPar}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}

          {status === 'pending' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => onAccept?.(e as unknown as React.MouseEvent)}
                  className="text-emerald-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accepter
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => onReject?.(e as unknown as React.MouseEvent)}
                  className="text-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{entreprise.emailEntreprise || 'Non renseigné'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{entreprise.telephoneEntreprise || 'Non renseigné'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-xs">{entreprise.ninea}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(entreprise.dateCreation)}</span>
        </div>
      </div>

      {/* Address */}
      {entreprise.adresse && (
        <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{entreprise.adresse}</span>
        </div>
      )}

      {/* Actions for pending status */}
      {status === 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.(e);
            }}
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accepter
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onReject?.(e);
            }}
            size="sm"
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Refuser
          </Button>
        </div>
      )}
    </div>
  );
};

export default CandidatureCard;
