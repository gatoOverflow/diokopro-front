"use client";

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  Save,
  X,
  Loader2,
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { updateEntrepriseBySuperAdmin } from '@/actions/superAdminActions';

interface EditEntrepriseDialogProps {
  entreprise: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedEntreprise: any) => void;
}

const EditEntrepriseDialog: React.FC<EditEntrepriseDialogProps> = ({
  entreprise,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomEntreprise: '',
    emailEntreprise: '',
    telephoneEntreprise: '',
    adresse: '',
    ninea: '',
    rccm: '',
    representéPar: '',
    supportFees: false,
  });

  useEffect(() => {
    if (entreprise) {
      setFormData({
        nomEntreprise: entreprise.nomEntreprise || '',
        emailEntreprise: entreprise.emailEntreprise || '',
        telephoneEntreprise: entreprise.telephoneEntreprise || '',
        adresse: entreprise.adresse || '',
        ninea: entreprise.ninea || '',
        rccm: entreprise.rccm || '',
        representéPar: entreprise.representéPar || '',
        supportFees: entreprise.supportFees || false,
      });
    }
  }, [entreprise]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateEntrepriseBySuperAdmin({
        entrepriseId: entreprise._id,
        ...formData,
      });

      if (result.type === 'error') {
        toast.error(result.error || 'Erreur lors de la mise à jour');
        return;
      }

      toast.success('Entreprise mise à jour avec succès');
      onSuccess?.(result.data);
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!entreprise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Modifier l'entreprise {entreprise.nomEntreprise}</DialogTitle>
          <DialogDescription>
            Formulaire de modification des informations de l'entreprise
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0cadec] to-[#0a8bc7] p-6 text-white flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Modifier l'entreprise</h2>
              <p className="text-white/80 text-sm">{entreprise.nomEntreprise}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Informations générales */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-[#0cadec]/10 rounded-lg">
                  <Building2 className="w-4 h-4 text-[#0cadec]" />
                </div>
                Informations générales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomEntreprise">Nom de l'entreprise *</Label>
                  <Input
                    id="nomEntreprise"
                    name="nomEntreprise"
                    value={formData.nomEntreprise}
                    onChange={handleInputChange}
                    placeholder="Nom de l'entreprise"
                    required
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representéPar">Représenté par</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="representéPar"
                      name="representéPar"
                      value={formData.representéPar}
                      onChange={handleInputChange}
                      placeholder="Nom du représentant"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailEntreprise">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="emailEntreprise"
                      name="emailEntreprise"
                      type="email"
                      value={formData.emailEntreprise}
                      onChange={handleInputChange}
                      placeholder="email@entreprise.com"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephoneEntreprise">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="telephoneEntreprise"
                      name="telephoneEntreprise"
                      value={formData.telephoneEntreprise}
                      onChange={handleInputChange}
                      placeholder="+221 77 000 00 00"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="Adresse complète"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informations légales */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>
                Informations légales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ninea">NINEA</Label>
                  <Input
                    id="ninea"
                    name="ninea"
                    value={formData.ninea}
                    onChange={handleInputChange}
                    placeholder="Numéro NINEA"
                    className="font-mono border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rccm">RCCM</Label>
                  <Input
                    id="rccm"
                    name="rccm"
                    value={formData.rccm}
                    onChange={handleInputChange}
                    placeholder="Numéro RCCM"
                    className="font-mono border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Frais de support</h4>
                  <p className="text-sm text-gray-500">
                    L'entreprise prend en charge les frais de transaction
                  </p>
                </div>
                <Switch
                  checked={formData.supportFees}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, supportFees: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#0cadec] hover:bg-[#0cadec]/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntrepriseDialog;
