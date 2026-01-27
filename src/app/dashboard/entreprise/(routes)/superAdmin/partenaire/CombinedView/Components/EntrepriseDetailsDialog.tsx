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
  Users,
  Wallet,
  Copy,
  Check,
  Power,
  Edit,
  Trash2,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface EntrepriseDetailsDialogProps {
  entreprise: any;
  isOpen: boolean;
  onClose: () => void;
}

const EntrepriseDetailsDialog: React.FC<EntrepriseDetailsDialogProps> = ({
  entreprise,
  isOpen,
  onClose,
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

  const handleEdit = () => {
    toast.info('Fonctionnalité de modification à venir');
  };

  const handleToggleStatus = () => {
    toast.info(`${entreprise.estActif ? 'Désactivation' : 'Activation'} à venir`);
  };

  const handleDelete = () => {
    toast.info('Fonctionnalité de suppression à venir');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Accessible Title (hidden visually) */}
        <VisuallyHidden.Root>
          <DialogTitle>Détails de l'entreprise {entreprise.nomEntreprise}</DialogTitle>
          <DialogDescription>
            Informations détaillées sur l'entreprise {entreprise.nomEntreprise}
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header with gradient - FIXED */}
        <div className="relative bg-gradient-to-r from-[#0cadec] to-[#0a8bc7] p-6 text-white flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />

          <div className="relative flex items-start gap-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-white/30 shadow-xl">
              <AvatarImage src={entreprise.logo} alt={entreprise.nomEntreprise} />
              <AvatarFallback className="bg-white text-[#0cadec] text-xl sm:text-2xl font-bold">
                {getInitials(entreprise.nomEntreprise)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate" aria-label="Nom de l'entreprise">
                {entreprise.nomEntreprise}
              </h2>
              {entreprise.representéPar && (
                <p className="text-white/80 text-sm mb-3">
                  Représenté par {entreprise.representéPar}
                </p>
              )}
              <Badge
                className={`${
                  entreprise.estActif
                    ? 'bg-green-500/20 text-green-100 border-green-400/50'
                    : 'bg-red-500/20 text-red-100 border-red-400/50'
                } border`}
              >
                {entreprise.estActif ? 'Entreprise Active' : 'Entreprise Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content - SCROLLABLE */}
        <div className="p-6 overflow-y-auto flex-1">
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
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="text-3xl font-bold text-emerald-600">
                  {entreprise.stats?.clients || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Clients</p>
            </div>
          </div>

          {/* Admin info */}
          {entreprise.admin && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300 mb-6">
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

          {/* Gerants */}
          {entreprise.gerants && entreprise.gerants.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-cyan-100 rounded-lg">
                  <Users className="w-4 h-4 text-cyan-600" />
                </div>
                Gérants ({entreprise.gerants.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {entreprise.gerants.map((gerant: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xs">
                        {getInitials(`${gerant.prenom} ${gerant.nom}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">
                      {gerant.prenom} {gerant.nom}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions - FIXED */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                className={`border-gray-300 ${
                  entreprise.estActif
                    ? 'text-red-600 hover:bg-red-50 hover:border-red-300'
                    : 'text-green-600 hover:bg-green-50 hover:border-green-300'
                }`}
              >
                <Power className="w-4 h-4 mr-2" />
                {entreprise.estActif ? 'Désactiver' : 'Activer'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 flex-1 sm:flex-none"
              >
                Fermer
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-[#0cadec] hover:bg-[#0cadec]/90 flex-1 sm:flex-none"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntrepriseDetailsDialog;
