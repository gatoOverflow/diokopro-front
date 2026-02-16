"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText,
  Calendar,
  Filter,
  Loader2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  Wallet,
  Power,
  Edit,
  Clock,
  Globe,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { getAuditLogEntreprise } from '@/actions/superAdminActions';

interface AuditLogDialogProps {
  entreprise: any;
  isOpen: boolean;
  onClose: () => void;
}

interface AuditLog {
  _id: string;
  acteur: {
    id: string;
    nom: string;
    prenom?: string;
    role: string;
  };
  action: string;
  cible: {
    type: string;
    id: string;
    nom?: string;
  };
  modifications?: {
    avant?: any;
    apres?: any;
    champsModifies?: string[];
  };
  solde?: {
    montant: number;
    type: string;
    motif: string;
    soldeAvant: number;
    soldeApres: number;
  };
  description?: string;
  contexte?: {
    ipAddress?: string;
    endpoint?: string;
    methode?: string;
  };
  resultat: string;
  createdAt: string;
}

interface AuditLogResponse {
  entreprise: {
    id: string;
    nomEntreprise: string;
  };
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ENTREPRISE_MODIFIEE: {
    label: 'Modification',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: <Edit className="w-4 h-4" />,
  },
  ENTREPRISE_ACTIVEE: {
    label: 'Activation',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: <Power className="w-4 h-4" />,
  },
  ENTREPRISE_DESACTIVEE: {
    label: 'Désactivation',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: <Power className="w-4 h-4" />,
  },
  SOLDE_CREDITE: {
    label: 'Crédit solde',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: <Wallet className="w-4 h-4" />,
  },
  SOLDE_DEBITE: {
    label: 'Débit solde',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: <Wallet className="w-4 h-4" />,
  },
  ENTREPRISE_CREEE: {
    label: 'Création',
    color: 'bg-violet-100 text-violet-700 border-violet-300',
    icon: <Building2 className="w-4 h-4" />,
  },
};

const AuditLogDialog: React.FC<AuditLogDialogProps> = ({
  entreprise,
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const fetchAuditLogs = useCallback(async () => {
    if (!entreprise?._id) return;

    setIsLoading(true);
    try {
      const result = await getAuditLogEntreprise(entreprise._id, {
        page: currentPage,
        limit,
        action: actionFilter !== 'all' ? actionFilter : undefined,
      });

      if (result.type === 'error') {
        toast.error(result.error || 'Erreur lors du chargement');
        return;
      }

      setData(result.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [entreprise?._id, currentPage, actionFilter, limit]);

  useEffect(() => {
    if (isOpen && entreprise?._id) {
      fetchAuditLogs();
    }
  }, [isOpen, entreprise?._id, fetchAuditLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter]);

  const getActionInfo = (action: string) => {
    return (
      ACTION_LABELS[action] || {
        label: action,
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: <ScrollText className="w-4 h-4" />,
      }
    );
  };

  if (!entreprise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Historique des actions - {entreprise.nomEntreprise}</DialogTitle>
          <DialogDescription>
            Journal d'audit complet de l'entreprise
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Journal d'audit</h2>
              <p className="text-white/80 text-sm">{entreprise.nomEntreprise}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48 border-gray-300">
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="ENTREPRISE_MODIFIEE">Modifications</SelectItem>
                <SelectItem value="ENTREPRISE_ACTIVEE">Activations</SelectItem>
                <SelectItem value="ENTREPRISE_DESACTIVEE">Désactivations</SelectItem>
                <SelectItem value="SOLDE_CREDITE">Crédits solde</SelectItem>
                <SelectItem value="SOLDE_DEBITE">Débits solde</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="border-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && !data ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : data?.logs && data.logs.length > 0 ? (
            <div className="space-y-3">
              {data.logs.map((log) => {
                const actionInfo = getActionInfo(log.action);
                return (
                  <div
                    key={log._id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${actionInfo.color.split(' ')[0]}`}>
                        {actionInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className={actionInfo.color}>
                            {actionInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(log.createdAt)}
                          </span>
                          {log.resultat && (
                            <Badge
                              variant="outline"
                              className={
                                log.resultat === 'succes'
                                  ? 'border-green-300 text-green-700 bg-green-50'
                                  : 'border-red-300 text-red-700 bg-red-50'
                              }
                            >
                              {log.resultat === 'succes' ? 'Succès' : 'Échec'}
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-2">
                          {log.description || 'Aucune description'}
                        </p>

                        {/* Solde details */}
                        {log.solde && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-2 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-500">Montant:</span>
                              <span
                                className={`font-bold ${
                                  log.solde.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                                }`}
                              >
                                {log.solde.type === 'credit' ? '+' : '-'}
                                {formatAmount(log.solde.montant)} FCFA
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {formatAmount(log.solde.soldeAvant)} → {formatAmount(log.solde.soldeApres)} FCFA
                              </span>
                            </div>
                            {log.solde.motif && (
                              <p className="text-xs text-gray-600 mt-1">
                                Motif: {log.solde.motif}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Champs modifiés */}
                        {log.modifications?.champsModifies && log.modifications.champsModifies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {log.modifications.champsModifies.map((champ) => (
                              <Badge key={champ} variant="outline" className="text-xs border-gray-300">
                                {champ}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Acteur */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>
                            Par {log.acteur.prenom} {log.acteur.nom}
                            <Badge variant="outline" className="ml-2 text-xs py-0">
                              {log.acteur.role}
                            </Badge>
                          </span>
                        </div>

                        {/* Contexte technique */}
                        {log.contexte?.ipAddress && (
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <Globe className="w-3 h-3" />
                            <span>IP: {log.contexte.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucune action enregistrée</p>
              <p className="text-sm text-gray-400">
                {actionFilter !== 'all'
                  ? 'Aucune action de ce type trouvée'
                  : "Le journal d'audit de cette entreprise est vide"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-gray-500">
              Page {data.pagination.page} sur {data.pagination.totalPages}
              <span className="ml-2 text-gray-400">({data.pagination.total} actions)</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="border-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={currentPage === data.pagination.totalPages || isLoading}
                className="border-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full border-gray-300">
            <X className="w-4 h-4 mr-2" />
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDialog;
