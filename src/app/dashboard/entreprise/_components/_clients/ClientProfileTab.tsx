import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus, Calendar, DollarSign } from 'lucide-react';
import { Client, Service, NiveauService } from '@/app/lib/types';

interface ClientProfileTabProps {
  client: Client;
  isEditing: boolean;
  formData: Partial<Client>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Service management
  services: Service[];
  isAddingService: boolean;
  selectedServiceId: string;
  selectedNiveauService: string;
  selectedServiceNiveaux: NiveauService[];
  
  // Handlers
  onAddService?: () => void;
  onRemoveFromService?: (serviceId: string) => void;
  toggleAddServiceMode: () => void;
  handleServiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleNiveauServiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  showRemoveFromServiceConfirmation: (serviceId: string) => void;
}

const ClientProfileTab: React.FC<ClientProfileTabProps> = ({
  client,
  isEditing,
  formData,
  onInputChange,
  onCheckboxChange,
  services,
  isAddingService,
  selectedServiceId,
  selectedNiveauService,
  selectedServiceNiveaux,
  onAddService,
  onRemoveFromService,
  toggleAddServiceMode,
  handleServiceChange,
  handleNiveauServiceChange,
  showRemoveFromServiceConfirmation
}) => {

  // Fonction pour les champs conditionnels basés sur la fréquence de paiement
  const renderFrequencyFields = () => {
    if (!isEditing) return null;

    switch (formData.frequencePaiement) {
      case 'mensuel':
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Jour du mois:</div>
            <div className="col-span-3">
              <Input
                type="number"
                name="jourPaiement"
                value={formData.jourPaiement || 1}
                onChange={onInputChange}
                min="1"
                max="31"
                placeholder="Jour du mois (1-31)"
              />
              <span className="text-xs text-gray-500 mt-1">Jour du mois où le paiement sera effectué</span>
            </div>
          </div>
        );
        case 'journalier':
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Nombre de Jour</div>
            <div className="col-span-3">
              <Input
                type="number"
                name="intervallePaiement"
                value={formData.intervallePaiement || 1}
                onChange={onInputChange}
                min="0"
              
                placeholder="Choisir le nombre de jour "
              />
              <span className="text-xs text-gray-500 mt-1">Choisir le nombre de jour paiement sera effectué</span>
            </div>
          </div>
        );
      /* case 'hebdomadaire':
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Jour de la semaine:</div>
            <div className="col-span-3">
              <select
                name="jourPaiement"
                value={formData.jourPaiement || 0}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="0">Dimanche</option>
                <option value="1">Lundi</option>
                <option value="2">Mardi</option>
                <option value="3">Mercredi</option>
                <option value="4">Jeudi</option>
                <option value="5">Vendredi</option>
                <option value="6">Samedi</option>
              </select>
            </div>
          </div>
        ); */
      case 'horaire':
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Intervalle (heures):</div>
            <div className="col-span-3">
              <Input
                type="number"
                name="intervallePaiement"
                value={formData.intervallePaiement || 1}
                onChange={onInputChange}
                min="1"
                max="24"
                placeholder="Nombre d'heures (1-24)"
              />
              <span className="text-xs text-gray-500 mt-1">Nombre d'heures entre chaque paiement</span>
            </div>
          </div>
        );
      case 'minute':
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Intervalle (minutes):</div>
            <div className="col-span-3">
              <Input
                type="number"
                name="intervallePaiement"
                value={formData.intervallePaiement || 1}
                onChange={onInputChange}
                min="1"
                max="60"
                placeholder="Nombre de minutes (1-60)"
              />
              <span className="text-xs text-gray-500 mt-1">Nombre de minutes entre chaque paiement</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-4 py-4">
      {/* Informations personnelles */}
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Nom:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="nom"
              value={formData.nom || ''}
              onChange={onInputChange}
            />
          ) : (
            client.nom
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Prénom:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="prenom"
              value={formData.prenom || ''}
              onChange={onInputChange}
            />
          ) : (
            client.prenom
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Email:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="email"
              value={formData.email || ''}
              onChange={onInputChange}
            />
          ) : (
            client.email
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Téléphone:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="telephone"
              value={formData.telephone || ''}
              onChange={onInputChange}
            />
          ) : (
            client.telephone
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Adresse:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="adresse"
              value={formData.adresse || ''}
              onChange={onInputChange}
            />
          ) : (
            client.adresse || "-"
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">NIN:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="nin"
              value={formData.nin || ''}
              onChange={onInputChange}
            />
          ) : (
            client.nin || "-"
          )}
        </div>
      </div>

      {/* Montant à payer */}
      

      {/* Section des paramètres de paiement en mode édition */}
      {isEditing && (
        <>
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-orange-500" />
              Paramètres de paiement
            </h3>

            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <div className="font-semibold text-right">Fréquence de paiement:</div>
              <div className="col-span-3">
                <select
                  name="frequencePaiement"
                  value={formData.frequencePaiement || 'mensuel'}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="mensuel">Mensuel</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="journalier">Journalier</option>
                  <option value="horaire">Horaire</option>
                  <option value="minute">Minute</option>
                  <option value="unique">Paiement unique</option>
                </select>
              </div>
            </div>

            {/* Champs conditionnels basés sur la fréquence */}
            {renderFrequencyFields()}

            {/* Checkbox aDejaPaye */}
            <div className="grid grid-cols-4 items-center gap-4 mt-4">
              <div className="font-semibold text-right">Statut de paiement:</div>
              <div className="col-span-3">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="aFAirePayer"
                      checked={formData.aFAirePayer}
                      onChange={onCheckboxChange || onInputChange}
                      className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <div className="flex flex-col">
                      <span className={`font-medium ${formData.aFAirePayer ? 'text-green-600' : 'text-gray-700'}`}>
                        {formData.aFAirePayer ? '✅ Client payé' : '❌ Client non payé'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formData.aFAirePayer 
                          ? 'Ce client a effectué ses paiements'
                          : 'Ce client n\'a pas encore payé'
                        }
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Date de prochain paiement avec heure */}
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Prochain paiement:</div>
        <div className="col-span-3">
          {isEditing ? (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <Input
                type="datetime-local"
                name="dateProgrammee"
                value={(() => {
                  const date = formData.dateProgrammee;
                  if (!date) return "";
                  
                  try {
                    if (date instanceof Date) {
                      return date.toISOString().slice(0, 16);
                    } else if (typeof date === 'string') {
                      if (date.includes('T')) {
                        return date.slice(0, 16);
                      }
                      return new Date(date).toISOString().slice(0, 16);
                    }
                  } catch (error) {
                    console.error("Erreur de conversion de date:", error);
                  }
                  return "";
                })()}
                onChange={onInputChange}
                className="flex-1"
              />
            </div>
          ) : (
            (() => {
              const date = client.dateProgrammee;
              if (!date) return "-";
              
              try {
                if (date instanceof Date) {
                  return date.toLocaleString("fr-FR");
                } else if (typeof date === 'string') {
                  return new Date(date).toLocaleString("fr-FR");
                }
              } catch (error) {
                console.error("Erreur d'affichage de date:", error);
              }
              return "-";
            })()
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          {/* Statut de paiement en lecture seule */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Statut:</div>
            <div className="col-span-3">
              <Badge variant={client.aDejaPaye ? "default" : "secondary"}>
                {client.aDejaPaye ? "Client payé" : "Client non payé"}
              </Badge>
            </div>
          </div>

        

          

          <div className="grid grid-cols-4 items-start gap-4">
            <div className="font-semibold text-right">Services:</div>
            <div className="col-span-3">
              {client.servicesChoisis && client.servicesChoisis.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.servicesChoisis.map((service, index) => (
                    <div key={index} className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary">
                        {service.nomService}
                      </Badge>
                      {onRemoveFromService && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => showRemoveFromServiceConfirmation(service._id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Retirer
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">Aucun service sélectionné</span>
              )}
              
              {onAddService && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={toggleAddServiceMode}
                >
                  {isAddingService ? (
                    <>Annuler</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un service
                    </>
                  )}
                </Button>
              )}
              
              {isAddingService && (
                <div className="mt-4 p-3 border rounded-md bg-gray-50">
                  <h4 className="font-medium mb-2">Ajouter un service</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="service-select">Service</Label>
                      <select
                        id="service-select"
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                        value={selectedServiceId}
                        onChange={handleServiceChange}
                      >
                        <option value="">Sélectionner un service</option>
                        {Array.isArray(services) && services.length > 0 ? (
                          services
                            .filter(service => 
                              !client.servicesChoisis?.some(clientService => 
                                clientService._id === service._id
                              )
                            )
                            .map(service => (
                              <option key={service._id} value={service._id}>
                                {service.nomService}
                              </option>
                            ))
                        ) : (
                          <option value="" disabled>Aucun service disponible</option>
                        )}
                      </select>
                    </div>
                    
                    {selectedServiceId && selectedServiceNiveaux.length > 0 && (
                      <div>
                        <Label htmlFor="niveau-select">Niveau de service</Label>
                        <select
                          id="niveau-select"
                          className="w-full border border-gray-300 rounded-md p-2 mt-1"
                          value={selectedNiveauService}
                          onChange={handleNiveauServiceChange}
                        >
                          <option value="">Sélectionner un niveau</option>
                          {selectedServiceNiveaux.map((niveau, index) => (
                            <option key={niveau._id || index} value={niveau.nom}>
                              {niveau.nom} - {niveau.tarif} FCFA
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={onAddService}
                        disabled={!selectedServiceId || !selectedNiveauService}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientProfileTab;