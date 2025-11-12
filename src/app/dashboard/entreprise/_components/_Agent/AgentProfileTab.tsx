import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus, Calendar, DollarSign } from 'lucide-react';
import { Agent, Service, NiveauService } from '@/app/lib/types';

interface AgentProfileTabProps {
  agent: Agent;
  isEditing: boolean;
  formData: Partial<Agent>;
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

const AgentProfileTab: React.FC<AgentProfileTabProps> = ({
  agent,
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

  // Wallet options
  const walletOptions = [
    { value: 'orange-money-senegal', label: 'Orange Money Sénégal' },
    { value: 'free-money-senegal', label: 'Free Money Sénégal' },
    { value: 'wave-senegal', label: 'Wave Sénégal' },
  ];

  // Fonction helper pour afficher les erreurs d'un champ
  const getFieldError = (fieldName: string) => {
    // Vous pouvez ajouter la gestion des erreurs ici si nécessaire
    return null;
  };

  // Fonction pour les champs conditionnels basés sur la fréquence de paiement
  const renderFrequencyFields = () => {
    if (!isEditing) return null;

    switch (formData.frequencePaiement) {
      case 'mensuel':
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Intervalle (Mois)</div>
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
     case 'quotidien':
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <div className="font-semibold text-right">Intervalle (jours):</div>
      <div className="col-span-3">
        <Input
          type="number"
          name="intervallePaiement"
          value={formData.intervallePaiement || 1}
          onChange={onInputChange}
          min="1"
          max="365"
          placeholder="Nombre de jours (1-365)"
        />
        <span className="text-xs text-gray-500 mt-1">Nombre de jours entre chaque paiement</span>
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
        <div className="font-semibold text-right">Last Name:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="nom"
              value={formData.nom || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.nom
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">First Name:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="prenom"
              value={formData.prenom || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.prenom
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
            agent.email
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Phone:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="telephone"
              value={formData.telephone || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.telephone
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Wallet:</div>
        <div className="col-span-3">
          {isEditing ? (
            <div className="flex flex-col space-y-1 w-full">
              <select
                name="wallet"
                value={formData.wallet || ''}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >

                {walletOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500">Choose the mobile money service for payments</span>
            </div>
          ) : (
            (() => {
              const selectedWallet = walletOptions.find(option => option.value === agent.wallet);
              return selectedWallet ? selectedWallet.label : agent.wallet || "-";
            })()
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Address:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="adresse"
              value={formData.adresse || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.adresse || "-"
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Fonction:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="fonction"
              value={formData.fonction || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.fonction || "-"
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
            agent.nin || "-"
          )}
        </div>
      </div>

      {/* Salaire */}
      {isEditing && (
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="font-semibold text-right">Salaire:</div>
          <div className="col-span-3">
            <Input
              type="number"
              name="salaire"
              value={formData.salaire || ''}
              onChange={onInputChange}
              placeholder="Montant du salaire"
            />
          </div>
        </div>
      )}

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
                  <option value="quotidien">Quotidien</option>
                  <option value="horaire">Horaire</option>
                  <option value="minute">Minute</option>
                  <option value="unique">Paiement unique</option>
                </select>
              </div>
            </div>

            {/* Champs conditionnels basés sur la fréquence */}
            {renderFrequencyFields()}

            {/* Checkbox aPayer */}
            <div className="grid grid-cols-4 items-center gap-4 mt-4">
              <div className="font-semibold text-right">Statut de paiement:</div>
              <div className="col-span-3">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="aPayer"
                      checked={formData.aPayer || false}
                      onChange={onCheckboxChange || onInputChange}
                      className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <div className="flex flex-col">
                      <span className={`font-medium ${formData.aPayer ? 'text-green-600' : 'text-gray-700'}`}>
                        {formData.aPayer ? '✅ Agent à payer' : '❌ Agent non payé'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formData.aPayer
                          ? 'Cet agent recevra des paiements automatiques selon la fréquence définie'
                          : 'Cet agent ne recevra pas de paiements automatiques'
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

      {/* Date de prochain virement avec heure */}
<div className="grid grid-cols-4 items-center gap-4">
  <div className="font-semibold text-right">Prochain virement:</div>
  <div className="col-span-3">
    {isEditing ? (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <Input
            type="datetime-local"
            name="dateProchainVirement"
            value={(() => {
              const date = formData.dateProchainVirement;
              if (!date) return "";

              try {
                if (date instanceof Date) {
                  return date.toISOString().slice(0, 16);
                } else if (typeof date === 'string') {
                  // Si c'est déjà au format ISO, on le retourne tel quel (truncated pour datetime-local)
                  if (date.includes('T')) {
                    return date.slice(0, 16);
                  }
                  // Sinon, on essaie de le convertir
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

        {/* Texte explicatif en mode édition - aligné avec le calendrier */}
        {/* {formData.dateProchainVirement && formData.frequencePaiement && formData.frequencePaiement !== 'unique' && (
          <div className="ml-6 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center mb-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span className="font-medium">Activation automatique:</span>
            </div>
            {(() => {
              try {
                const nextPayment = new Date(formData.dateProchainVirement);
                let activationText = "";

                switch (formData.frequencePaiement) {
                  case 'mensuel':
                    const nextMonth = new Date(nextPayment);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    activationText = `Prochain paiement le ${nextMonth.toLocaleDateString("fr-FR")} puis chaque mois`;
                    break;

                  case 'hebdomadaire':
                    const nextWeek = new Date(nextPayment);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    activationText = `Prochain paiement le ${nextWeek.toLocaleDateString("fr-FR")} puis chaque semaine`;
                    break;

                  case 'quotidien':
                    const interval = formData.intervallePaiement || 1;
                    const nextDay = new Date(nextPayment);
                    nextDay.setDate(nextDay.getDate() + interval);
                    activationText = `Prochain paiement le ${nextDay.toLocaleDateString("fr-FR")} puis tous les ${interval} jour${interval > 1 ? 's' : ''}`;
                    break;

                  case 'horaire':
                    const hourInterval = formData.intervallePaiement || 1;
                    const nextHour = new Date(nextPayment);
                    nextHour.setHours(nextHour.getHours() + hourInterval);
                    activationText = `Prochain paiement le ${nextHour.toLocaleString("fr-FR")} puis toutes les ${hourInterval} heure${hourInterval > 1 ? 's' : ''}`;
                    break;

                  case 'minute':
                    const minuteInterval = formData.intervallePaiement || 1;
                    const nextMinute = new Date(nextPayment);
                    nextMinute.setMinutes(nextMinute.getMinutes() + minuteInterval);
                    activationText = `Prochain paiement le ${nextMinute.toLocaleString("fr-FR")} puis toutes les ${minuteInterval} minute${minuteInterval > 1 ? 's' : ''}`;
                    break;

                  default:
                    activationText = "Paiement programmé selon la fréquence définie";
                }

                return (
                  <div className="text-xs leading-relaxed">
                    {activationText}
                  </div>
                );
              } catch (error) {
                return (
                  <div className="text-xs text-red-600">
                    Erreur de calcul de la prochaine activation
                  </div>
                );
              }
            })()}
          </div>
        )} */}
      </div>
    ) : (
      <div className="flex flex-col space-y-2">
        {(() => {
          const date = agent.dateProchainVirement;
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
        })()}

        {/* Texte explicatif en mode lecture */}
        
       
      </div>
    )}
  </div>
</div>

      {!isEditing && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Status:</div>
            <div className="col-span-3">
              <Badge variant={agent.estNouveau ? "default" : "secondary"}>
                {agent.estNouveau ? "New agent" : "Existing agent"}
              </Badge>
            </div>
          </div>

          {agent.dateCreation && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="font-semibold text-right">Creation date:</div>
              <div className="col-span-3">
                {new Date(agent.dateCreation).toLocaleDateString('fr-FR')}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <div className="font-semibold text-right">Services:</div>
            <div className="col-span-3">
              {agent.servicesAffecte && agent.servicesAffecte.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.servicesAffecte.map((service, index) => (
                    <div key={index} className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary">
                        {service?.nomService}
                      </Badge>
                      {onRemoveFromService && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => showRemoveFromServiceConfirmation(service._id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No services selected</span>
              )}

              {onAddService && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={toggleAddServiceMode}
                >
                  {isAddingService ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add a service
                    </>
                  )}
                </Button>
              )}

              {isAddingService && (
                <div className="mt-4 p-3 border rounded-md bg-gray-50">
                  <h4 className="font-medium mb-2">Add a service</h4>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="service-select">Service</Label>
                      <select
                        id="service-select"
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                        value={selectedServiceId}
                        onChange={handleServiceChange}
                      >
                        <option value="">Select a service</option>
                        {Array.isArray(services) && services.length > 0 ? (
                          services
                            .filter(service =>
                              !agent.servicesAffecte?.some(agentService =>
                                agentService._id === service._id
                              )
                            )
                            .map(service => (
                              <option key={service._id} value={service._id}>
                                {service.nomService}
                              </option>
                            ))
                        ) : (
                          <option value="" disabled>No services available</option>
                        )}
                      </select>
                    </div>

                    {selectedServiceId && selectedServiceNiveaux.length > 0 && (
                      <div>
                        <Label htmlFor="niveau-select">Service level</Label>
                        <select
                          id="niveau-select"
                          className="w-full border border-gray-300 rounded-md p-2 mt-1"
                          value={selectedNiveauService}
                          onChange={handleNiveauServiceChange}
                        >
                          <option value="">Select a level</option>
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
                        Add
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

export default AgentProfileTab;