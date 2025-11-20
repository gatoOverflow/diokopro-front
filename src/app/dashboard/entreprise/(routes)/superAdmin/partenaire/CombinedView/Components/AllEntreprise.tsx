import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { toggleEntrepriseStatus } from '@/actions/acceptEntreprise';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Phone, MapPin, Calendar, FileText, User, Users, Info, X, Wallet } from 'lucide-react';

interface GerantListProps {
  agents: any[];
  totalGerants: number;
  onGerantClick: (gerant: any) => void;
  searchTerm: string;
}

const AllEntreprise: React.FC<GerantListProps> = ({ 
  agents = [], 
  totalGerants, 
  onGerantClick, 
  searchTerm 
}) => {
  // État pour suivre quels gérants sont actifs
  const [activeAgents, setActiveAgents] = useState({});
  const [isUpdating, setIsUpdating] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState<any | null>(null);
  
  // Initialiser l'état des toggles basé sur estActif
  useEffect(() => {
    if (agents && agents.length > 0) {
      const initialActiveState = agents.reduce((acc, agent) => {
        // Utiliser estActif si disponible, sinon false par défaut
        acc[agent._id] = agent.estActif || false;
        return acc;
      }, {});
      setActiveAgents(initialActiveState);
    }
  }, [agents]);

  const handleToggleChange = async (id, event) => {
    event.stopPropagation();
    
    const newStatus = !activeAgents[id];
    
    // Mise à jour optimiste de l'UI
    setActiveAgents(prev => ({
      ...prev,
      [id]: newStatus
    }));
    
    // Indiquer que la mise à jour est en cours
    setIsUpdating(prev => ({
      ...prev,
      [id]: true
    }));
    
    try {
      // Appel à l'API
      const result = await toggleEntrepriseStatus(id, newStatus);
      
      if (result.type === 'error') {
        // En cas d'erreur, revenir à l'état précédent
        setActiveAgents(prev => ({
          ...prev,
          [id]: !newStatus
        }));
        
        // Afficher l'erreur (vous pouvez utiliser un toast ici)
        console.error('Erreur:', result.error);
        alert(result.error);
      } else {
        // Succès
        console.log('Statut mis à jour avec succès:', result.message);
        // Vous pouvez afficher un toast de succès ici
      }
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      setActiveAgents(prev => ({
        ...prev,
        [id]: !newStatus
      }));
      console.error('Erreur lors de la mise à jour:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut');
    } finally {
      // Fin de la mise à jour
      setIsUpdating(prev => ({
        ...prev,
        [id]: false
      }));
    }
  };

  const handleCardClick = (gerant: any) => {
    setSelectedEntreprise(gerant);
    setDetailsOpen(true);
    // Appeler aussi la fonction onGerantClick si elle existe
    if (onGerantClick) {
      onGerantClick(gerant);
    }
  };

  return (
    <>
      <div className="w-full p-4">
        <div className="grid grid-cols-4 gap-4">
          {agents && agents.length > 0 ? (
            agents.map((gerant) => (
              <div 
                key={gerant._id} 
                className="bg-white rounded-md shadow-sm border border-gray-100 p-3 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick(gerant)}
              >
                <div className="flex flex-col items-center space-y-5 w-full">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-500">
                    {gerant.logo ? (
                      <img 
                        src={gerant.logo} 
                        alt={gerant.nomEntreprise} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                        alt="Photo gérant" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-xl text-gray-700 text-center">
                    {gerant.nomEntreprise ? gerant.nomEntreprise.substring(0, 8) : (gerant.nom ? gerant.nom.substring(0, 8) : (gerant._id ? gerant._id.substring(0, 3) : ""))}
                  </div>
                </div>
                <div className="mt-2 w-full flex justify-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={activeAgents[gerant._id] || false} 
                      onChange={(e) => handleToggleChange(gerant._id, e)}
                      disabled={isUpdating[gerant._id]}
                      className="sr-only peer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={`w-11 h-6 rounded-full peer 
                      ${activeAgents[gerant._id] ? 'bg-green-500' : 'bg-gray-200'} 
                      ${isUpdating[gerant._id] ? 'opacity-50 cursor-not-allowed' : ''}
                      peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                      after:transition-all
                      ${activeAgents[gerant._id] ? 'after:translate-x-5' : ''}`}>
                      {isUpdating[gerant._id] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              {searchTerm ? "Aucun gérant ne correspond à votre recherche" : "Aucun gérant trouvé"}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-3xl mx-4 max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-500" />
              Détails de l'entreprise
            </DialogTitle>
          </DialogHeader>

          {selectedEntreprise && (
            <div className="space-y-6 py-4">
              {/* Header avec logo et nom */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-500 flex-shrink-0">
                  {selectedEntreprise.logo ? (
                    <img 
                      src={selectedEntreprise.logo} 
                      alt={selectedEntreprise.nomEntreprise} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedEntreprise.nomEntreprise}</h3>
                  <p className="text-gray-600">{selectedEntreprise.representéPar}</p>
                  <div className="mt-2">
                    <Badge className={selectedEntreprise.estActif ? 'bg-green-500' : 'bg-red-500'}>
                      {selectedEntreprise.estActif ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coordonnées */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Coordonnées
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Email</p>
                        <p className="text-sm text-gray-900 break-all">{selectedEntreprise.emailEntreprise}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Téléphone</p>
                        <p className="text-sm text-gray-900">{selectedEntreprise.telephoneEntreprise}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Adresse</p>
                        <p className="text-sm text-gray-900">{selectedEntreprise.adresse}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations légales */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Informations légales
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">NINEA</p>
                      <p className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded">
                        {selectedEntreprise.ninea}
                      </p>
                    </div>
                    {selectedEntreprise.rccm && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">RCCM</p>
                        <p className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded">
                          {selectedEntreprise.rccm}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Date de création</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedEntreprise.dateCreation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solde */}
              {selectedEntreprise.solde !== undefined && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Solde actuel</p>
                        <p className="text-3xl font-bold text-green-700">
                          {selectedEntreprise.solde.toLocaleString()} <span className="text-lg">FCFA</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistiques */}
              {selectedEntreprise.stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-blue-200 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <User className="w-6 h-6 text-blue-500" />
                      <p className="text-3xl font-bold text-blue-600">{selectedEntreprise.stats.agents || 0}</p>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Agents</p>
                  </div>
                  <div className="bg-white border-2 border-green-200 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-6 h-6 text-green-500" />
                      <p className="text-3xl font-bold text-green-600">{selectedEntreprise.stats.clients || 0}</p>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Clients</p>
                  </div>
                </div>
              )}

              {/* Administrateur */}
              {selectedEntreprise.admin && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Administrateur
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Nom complet</p>
                      <p className="text-sm text-gray-900">
                        {selectedEntreprise.admin.prenom} {selectedEntreprise.admin.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Email</p>
                      <p className="text-sm text-gray-900 break-all">{selectedEntreprise.admin.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Téléphone</p>
                      <p className="text-sm text-gray-900">{selectedEntreprise.admin.telephone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Rôle</p>
                      <Badge variant="outline">{selectedEntreprise.admin.role}</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Gérants */}
              {selectedEntreprise.gerants && selectedEntreprise.gerants.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    Gérants ({selectedEntreprise.gerants.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedEntreprise.gerants.map((gerant: any, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-sm text-gray-900">
                          {gerant.prenom} {gerant.nom}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Fermer
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AllEntreprise;