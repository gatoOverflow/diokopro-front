"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Loader2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
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
import { getTransactionsEntreprise } from '@/actions/superAdminActions';

interface TransactionsHistoryDialogProps {
  entreprise: any;
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  _id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  previousBalance: number;
  newBalance: number;
  status: string;
  createdAt: string;
  userId?: {
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

interface TransactionsResponse {
  entreprise: {
    id: string;
    nomEntreprise: string;
    soldeActuel: number;
  };
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const TransactionsHistoryDialog: React.FC<TransactionsHistoryDialogProps> = ({
  entreprise,
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchTransactions = useCallback(async () => {
    if (!entreprise?._id) return;

    setIsLoading(true);
    try {
      const result = await getTransactionsEntreprise(entreprise._id, {
        page: currentPage,
        limit,
        type: typeFilter !== 'all' ? typeFilter as 'credit' | 'debit' : undefined,
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
  }, [entreprise?._id, currentPage, typeFilter, limit]);

  useEffect(() => {
    if (isOpen && entreprise?._id) {
      fetchTransactions();
    }
  }, [isOpen, entreprise?._id, fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter]);

  if (!entreprise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Historique des transactions - {entreprise.nomEntreprise}</DialogTitle>
          <DialogDescription>
            Liste des transactions de solde de l'entreprise
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0cadec] to-[#0a8bc7] p-6 text-white flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Historique des transactions</h2>
                <p className="text-white/80 text-sm">{entreprise.nomEntreprise}</p>
              </div>
            </div>
            {data?.entreprise && (
              <div className="text-right">
                <p className="text-white/70 text-xs">Solde actuel</p>
                <p className="text-xl font-bold">{formatAmount(data.entreprise.soldeActuel)} FCFA</p>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 border-gray-300">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="credit">Crédits uniquement</SelectItem>
                <SelectItem value="debit">Débits uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
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
              <Loader2 className="w-8 h-8 animate-spin text-[#0cadec]" />
            </div>
          ) : data?.transactions && data.transactions.length > 0 ? (
            <div className="space-y-3">
              {data.transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === 'credit'
                            ? 'bg-emerald-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={
                              transaction.type === 'credit'
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                : 'border-red-300 text-red-700 bg-red-50'
                            }
                          >
                            {transaction.type === 'credit' ? 'Crédit' : 'Débit'}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {transaction.description || 'Aucune description'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Avant: <span className="font-medium">{formatAmount(transaction.previousBalance)}</span>
                          </span>
                          <span>→</span>
                          <span>
                            Après: <span className="font-medium">{formatAmount(transaction.newBalance)}</span>
                          </span>
                        </div>
                        {transaction.userId && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>
                              Par {transaction.userId.prenom} {transaction.userId.nom}
                              <Badge variant="outline" className="ml-2 text-xs py-0">
                                {transaction.userId.role}
                              </Badge>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">FCFA</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucune transaction</p>
              <p className="text-sm text-gray-400">
                {typeFilter !== 'all'
                  ? 'Aucune transaction de ce type trouvée'
                  : 'Cette entreprise n\'a pas encore de transactions'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-gray-500">
              Page {data.pagination.page} sur {data.pagination.totalPages}
              <span className="ml-2 text-gray-400">
                ({data.pagination.total} transactions)
              </span>
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
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-gray-300"
          >
            <X className="w-4 h-4 mr-2" />
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionsHistoryDialog;
