"use client";

import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Minus,
  FileText,
  Loader2,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { ajusterSoldeEntreprise } from '@/actions/superAdminActions';

interface AjusterSoldeDialogProps {
  entreprise: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transaction: any) => void;
}

const AjusterSoldeDialog: React.FC<AjusterSoldeDialogProps> = ({
  entreprise,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    if (!motif.trim()) {
      toast.error('Veuillez entrer un motif');
      return;
    }

    // Vérification solde suffisant pour débit
    if (type === 'debit' && montantNum > entreprise.solde) {
      toast.error('Solde insuffisant pour ce débit');
      return;
    }

    setIsLoading(true);

    try {
      const result = await ajusterSoldeEntreprise({
        entrepriseId: entreprise._id,
        montant: montantNum,
        type,
        motif: motif.trim(),
      });

      if (result.type === 'error') {
        toast.error(result.error || 'Erreur lors de l\'ajustement');
        return;
      }

      toast.success(
        type === 'credit'
          ? `${formatAmount(montantNum)} FCFA crédité avec succès`
          : `${formatAmount(montantNum)} FCFA débité avec succès`
      );

      onSuccess?.(result.data);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMontant('');
    setMotif('');
    setType('credit');
  };

  const nouveauSolde = () => {
    const montantNum = parseFloat(montant) || 0;
    if (type === 'credit') {
      return entreprise.solde + montantNum;
    }
    return entreprise.solde - montantNum;
  };

  if (!entreprise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => { handleReset(); onClose(); }}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Ajuster le solde de {entreprise.nomEntreprise}</DialogTitle>
          <DialogDescription>
            Créditer ou débiter le solde de l'entreprise
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header */}
        <div className={`relative p-6 text-white flex-shrink-0 ${
          type === 'credit'
            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ajuster le solde</h2>
              <p className="text-white/80 text-sm">{entreprise.nomEntreprise}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Solde actuel */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Solde actuel</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatAmount(entreprise.solde)} <span className="text-base text-gray-500">FCFA</span>
            </p>
          </div>

          {/* Type de transaction */}
          <div className="space-y-2">
            <Label>Type d'opération</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  type === 'credit'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Plus className={`w-6 h-6 mx-auto mb-2 ${
                  type === 'credit' ? 'text-emerald-500' : 'text-gray-400'
                }`} />
                <p className="font-semibold">Créditer</p>
                <p className="text-xs opacity-70">Ajouter au solde</p>
              </button>
              <button
                type="button"
                onClick={() => setType('debit')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  type === 'debit'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Minus className={`w-6 h-6 mx-auto mb-2 ${
                  type === 'debit' ? 'text-red-500' : 'text-gray-400'
                }`} />
                <p className="font-semibold">Débiter</p>
                <p className="text-xs opacity-70">Retirer du solde</p>
              </button>
            </div>
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="montant">Montant (FCFA)</Label>
            <div className="relative">
              <Input
                id="montant"
                type="number"
                min="1"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0"
                className="text-xl font-semibold h-14 pr-16 border-gray-300"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                FCFA
              </span>
            </div>
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label htmlFor="motif" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Motif de l'opération *
            </Label>
            <Textarea
              id="motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Correction de solde, Bonus partenariat, Ajustement comptable..."
              className="resize-none border-gray-300"
              rows={3}
              required
            />
          </div>

          {/* Aperçu */}
          {montant && parseFloat(montant) > 0 && (
            <div className={`rounded-xl p-4 border ${
              type === 'credit'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nouveau solde après opération</span>
                {type === 'debit' && parseFloat(montant) > entreprise.solde && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className={`text-2xl font-bold ${
                type === 'credit' ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {formatAmount(nouveauSolde())} <span className="text-base">FCFA</span>
              </p>
              {type === 'debit' && parseFloat(montant) > entreprise.solde && (
                <p className="text-xs text-red-600 mt-1">
                  Attention : le solde deviendra négatif
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { handleReset(); onClose(); }}
              disabled={isLoading}
              className="flex-1 border-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !montant || !motif.trim()}
              className={`flex-1 ${
                type === 'credit'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirmer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AjusterSoldeDialog;
