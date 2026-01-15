"use client";

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  type: 'accept' | 'reject';
  entrepriseName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  entrepriseName
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (type === 'reject' && !reason.trim()) {
      setError('Veuillez indiquer la raison du refus');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onConfirm(type === 'reject' ? reason : undefined);
      setReason('');
      onClose();
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              type === 'accept'
                ? 'bg-emerald-100'
                : 'bg-red-100'
            }`}>
              {type === 'accept' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <DialogTitle className="text-lg">
              {type === 'accept' ? 'Accepter la candidature' : 'Refuser la candidature'}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {type === 'accept'
              ? `Êtes-vous sûr de vouloir accepter la candidature de ${entrepriseName} ?`
              : `Êtes-vous sûr de vouloir refuser la candidature de ${entrepriseName} ?`}
          </DialogDescription>
        </DialogHeader>

        {type === 'reject' && (
          <div className="space-y-3 py-4">
            <Label htmlFor="reason" className="text-sm font-medium">
              Raison du refus <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Indiquez la raison du refus..."
              className="min-h-[100px] resize-none border-gray-300 focus:border-[#0cadec] focus:ring-[#0cadec]/30"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto border-gray-300"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`w-full sm:w-auto ${
              type === 'accept'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              'En cours...'
            ) : type === 'accept' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accepter
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Refuser
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
