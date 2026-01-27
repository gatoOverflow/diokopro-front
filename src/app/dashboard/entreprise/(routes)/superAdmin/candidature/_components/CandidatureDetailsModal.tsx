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
  Copy,
  Check,
  Info,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { InterfaceEntreprise } from '../../../_models/entreprise.model';

type CandidatureStatus = 'pending' | 'accepted' | 'rejected';

interface CandidatureDetailsModalProps {
  entreprise: InterfaceEntreprise | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

const CandidatureDetailsModal: React.FC<CandidatureDetailsModalProps> = ({
  entreprise,
  isOpen,
  onClose,
  onAccept,
  onReject
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!entreprise) return null;

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
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const copyToClipboard = async (text: string, field: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${label} copié !`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  // Determine status
  const getStatus = (): CandidatureStatus => {
    if (entreprise.estActif) return 'accepted';
    if (entreprise.raisonRefus) return 'rejected';
    return 'pending';
  };

  const status = getStatus();

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-500/20 text-amber-100 border-amber-400/50 border">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-green-500/20 text-green-100 border-green-400/50 border">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Acceptée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-100 border-red-400/50 border">
            <XCircle className="w-3 h-3 mr-1" />
            Refusée
          </Badge>
        );
    }
  };

  const getHeaderGradient = () => {
    switch (status) {
      case 'pending':
        return 'from-amber-500 to-orange-600';
      case 'accepted':
        return 'from-emerald-500 to-green-600';
      case 'rejected':
        return 'from-red-500 to-rose-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Accessible Title (hidden visually) */}
        <VisuallyHidden.Root>
          <DialogTitle>Détails de la candidature {entreprise.nomEntreprise}</DialogTitle>
          <DialogDescription>
            Informations détaillées sur la candidature de {entreprise.nomEntreprise}
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header with gradient - FIXED */}
        <div className={`relative bg-gradient-to-r ${getHeaderGradient()} p-6 text-white flex-shrink-0`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />

          <div className="relative flex items-start gap-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-white/30 shadow-xl">
              <AvatarImage src={entreprise.logo} alt={entreprise.nomEntreprise} />
              <AvatarFallback className="bg-white text-gray-700 text-xl sm:text-2xl font-bold">
                {getInitials(entreprise.nomEntreprise)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate">
                {entreprise.nomEntreprise}
              </h2>
              {entreprise.representéPar && (
                <p className="text-white/80 text-sm mb-3">
                  Représenté par {entreprise.representéPar}
                </p>
              )}
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Content - SCROLLABLE */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Rejection reason if rejected */}
          {status === 'rejected' && entreprise.raisonRefus && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Raison du refus
              </h4>
              <p className="text-red-700 text-sm">{entreprise.raisonRefus}</p>
            </div>
          )}

          {/* Solde Card */}
          {entreprise.solde !== undefined && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Solde disponible</p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
                      {formatAmount(entreprise.solde)} <span className="text-base sm:text-lg">FCFA</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Coordonnées */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-[#0cadec]/10 rounded-lg">
                  <Info className="w-4 h-4 text-[#0cadec]" />
                </div>
                Coordonnées
              </h4>
              <div className="space-y-3">
                {entreprise.emailEntreprise ? (
                  <div
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group"
                    onClick={() => copyToClipboard(entreprise.emailEntreprise, 'email', 'Email')}
                  >
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                      href={`mailto:${entreprise.emailEntreprise}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-[#0cadec] hover:underline flex-1 truncate"
                    >
                      {entreprise.emailEntreprise}
                    </a>
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Email non renseigné</p>
                )}

                {entreprise.telephoneEntreprise ? (
                  <div
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group"
                    onClick={() => copyToClipboard(entreprise.telephoneEntreprise, 'phone', 'Téléphone')}
                  >
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${entreprise.telephoneEntreprise}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-[#0cadec] hover:underline flex-1"
                    >
                      {entreprise.telephoneEntreprise}
                    </a>
                    {copiedField === 'phone' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Téléphone non renseigné</p>
                )}

                {entreprise.adresse ? (
                  <div className="flex items-start gap-3 p-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{entreprise.adresse}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic pl-2">Adresse non renseignée</p>
                )}
              </div>
            </div>

            {/* Informations légales */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>
                Informations légales
              </h4>
              <div className="space-y-3">
                {entreprise.ninea ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">NINEA</p>
                    <p className="text-sm font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-300">
                      {entreprise.ninea}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">NINEA non renseigné</p>
                )}

                {entreprise.rccm ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">RCCM</p>
                    <p className="text-sm font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-300">
                      {entreprise.rccm}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">RCCM non renseigné</p>
                )}

                {entreprise.dateCreation && (
                  <div className="flex items-center gap-2 pt-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Créée le {formatDate(entreprise.dateCreation)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {entreprise.stats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0cadec]/5 border border-[#0cadec]/30 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="w-5 h-5 text-[#0cadec]" />
                  <span className="text-3xl font-bold text-[#0cadec]">
                    {entreprise.stats?.agents || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Agents</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  <span className="text-3xl font-bold text-emerald-600">
                    {entreprise.stats?.clients || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Clients</p>
              </div>
            </div>
          )}

          {/* Admin info */}
          {entreprise.admin && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
                Administrateur
              </h4>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-amber-100 text-amber-700">
                    {getInitials(`${entreprise.admin.prenom} ${entreprise.admin.nom}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {entreprise.admin.prenom} {entreprise.admin.nom}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{entreprise.admin.email}</p>
                </div>
                <Badge variant="outline" className="text-xs border-gray-300">
                  {entreprise.admin.role}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions - FIXED */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left - Close */}
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
            >
              Fermer
            </Button>

            {/* Right - Actions for pending */}
            {status === 'pending' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onReject}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 flex-1 sm:flex-none"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  onClick={onAccept}
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accepter
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatureDetailsModal;
