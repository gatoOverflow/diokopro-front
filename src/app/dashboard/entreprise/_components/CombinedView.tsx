"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Users, FileText } from 'lucide-react';
import { Toaster, toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronDown, X, ChevronLeft, ChevronRight,Search } from "lucide-react";
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from "@/components/ui/popover";
import { 
    format, 
    startOfMonth, 
    endOfMonth,
    startOfWeek,
    endOfWeek, 
    eachDayOfInterval, 
    isToday, 
    isSameMonth,
    isEqual,
    parseISO,
    isWithinInterval,
    isAfter,
    isBefore,
    isSameDay
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceList from './_services/ServiceList';
import ServiceDialog from './_services/ServiceDialog';
import ClientDialog from './_clients/ClientDialog';
import AgentDialog from './_Agent/AgentDialog';
import GerantDialog from './_gerant/GerantDialog';
import CreateClientModal from '../../clientsPage/_components/Addclients';
import CreateAgentModal from '../../AgentPage/_components/AddAgents';
import CreateServiceModal from '../../_Service/_components/service';
import BalanceEntreprise from './Balance/BalanceEntreprise';
import { updateClient, deleteClient, removeClientFromService } from '@/actions/clientreq';
import { validateOTP } from '@/actions/service';
import { updatedGerant } from '@/actions/gerant';
import { deleteAgent, updatedAgent } from '@/actions/Agent';
import CreateGerantModal from '../../AgentEntre/_components/AgentEntreprise';

const CombinedView = ({
    services,
    serviceId,
    balance,
    clients,
    agentNotTopayer,
    agentapayer,
    agents,
    gerants,
    clientNotTopayer,
    entrepriseId,
    nomEntreprise
}) => {
    // États pour la pagination
    const [agentPage, setAgentPage] = useState(1);
    const [clientPage, setClientPage] = useState(1);
    const [servicePage, setServicePage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // États pour la recherche et le filtrage
    const [agentSearchTerm, setAgentSearchTerm] = useState('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [serviceSearchTerm, setServiceSearchTerm] = useState('');

    const [agentPaymentFilter, setAgentPaymentFilter] = useState('all');
    const [clientPaymentFilter, setClientPaymentFilter] = useState('all');

    // États pour la messagerie
    const [messageTitle, setMessageTitle] = useState('');
    const [messageContent, setMessageContent] = useState('');

    // États pour les éléments sélectionnés
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [selectedGerant, setSelectedGerant] = useState(null);

    // États pour les dialogues
    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
    const [isGerantDialogOpen, setIsGerantDialogOpen] = useState(false);

    // États pour les données filtrées
    const [filteredServices, setFilteredServices] = useState(services);
    const [filteredClients, setFilteredClients] = useState(clients);
    const [filteredAgents, setFilteredAgents] = useState(agents);
    const [dateFilterMode, setDateFilterMode] = useState('single'); // 'single' ou 'range'
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [dateFilterActive, setDateFilterActive] = useState(false);
    const [dateFilterType, setDateFilterType] = useState('all'); // 'all', 'paid', 'unpaid'
    const [step, setStep] = useState('from'); // 'from' ou 'to' pour le mode intervalle
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const formatDate = (date, formatStr) => {
        if (!date) return "";
        return format(date, formatStr, { locale: fr });
      };

      const filterAgentsByDate = (agents, date, filterType = 'all') => {
        if (!date) return agents;
        
        return agents.filter(agent => {
          // Pour les paiements déjà effectués (chercher dans virementsRecus)
          if (filterType === 'all' || filterType === 'paid') {
            if (agent.virementsRecus && agent.virementsRecus.length > 0) {
              const hasPaymentOnDate = agent.virementsRecus.some(virement => {
                if (!virement.datePaiement) return false;
                
                const paymentDate = typeof virement.datePaiement === 'string' 
                  ? parseISO(virement.datePaiement)
                  : new Date(virement.datePaiement);
                
                return isSameDay(paymentDate, date);
              });
              
              if (filterType === 'paid' && hasPaymentOnDate) return true;
              if (filterType === 'all' && hasPaymentOnDate) return true;
            }
          }
          
          // Pour les paiements à venir (chercher dans dateProchainVirement)
          if (filterType === 'all' || filterType === 'unpaid') {
            if (agent.dateProchainVirement) {
              const nextPaymentDate = typeof agent.dateProchainVirement === 'string' 
                ? parseISO(agent.dateProchainVirement)
                : new Date(agent.dateProchainVirement);
              
              const hasNextPaymentOnDate = isSameDay(nextPaymentDate, date);
              
              if (filterType === 'unpaid' && hasNextPaymentOnDate) return true;
              if (filterType === 'all' && hasNextPaymentOnDate) return true;
            }
          }
          
          return false;
        });
      };
      const filterAgentsByDateRange = (agents, dateRange, filterType = 'all') => {
        if (!dateRange.from || !dateRange.to) return agents;
        
        // Assurez-vous que la date "from" est avant la date "to"
        const from = dateRange.from < dateRange.to ? dateRange.from : dateRange.to;
        const to = dateRange.from < dateRange.to ? dateRange.to : dateRange.from;
        
        return agents.filter(agent => {
          // Pour les paiements déjà effectués (chercher dans virementsRecus)
          if (filterType === 'all' || filterType === 'paid') {
            if (agent.virementsRecus && agent.virementsRecus.length > 0) {
              const hasPaymentInRange = agent.virementsRecus.some(virement => {
                if (!virement.datePaiement) return false;
                
                const paymentDate = typeof virement.datePaiement === 'string' 
                  ? parseISO(virement.datePaiement)
                  : new Date(virement.datePaiement);
                
                return isWithinInterval(paymentDate, { start: from, end: to });
              });
              
              if (filterType === 'paid' && hasPaymentInRange) return true;
              if (filterType === 'all' && hasPaymentInRange) return true;
            }
          }
          
          // Pour les paiements à venir (chercher dans dateProchainVirement)
          if (filterType === 'all' || filterType === 'unpaid') {
            if (agent.dateProchainVirement) {
              const nextPaymentDate = typeof agent.dateProchainVirement === 'string' 
                ? parseISO(agent.dateProchainVirement)
                : new Date(agent.dateProchainVirement);
              
              const nextPaymentInRange = isWithinInterval(nextPaymentDate, { start: from, end: to });
              
              if (filterType === 'unpaid' && nextPaymentInRange) return true;
              if (filterType === 'all' && nextPaymentInRange) return true;
            }
          }
          
          return false;
        });
      };
    // Filtre les agents
    useEffect(() => {
        let result = [...agents];
      
        // Filtres textuels existants
        if (agentSearchTerm.trim() !== '') {
          const normalizedSearchTerm = agentSearchTerm.toLowerCase().trim();
          result = result.filter(agent =>
            agent.nom?.toLowerCase().includes(normalizedSearchTerm) ||
            agent.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
            agent.email?.toLowerCase().includes(normalizedSearchTerm) ||
            agent.telephone?.includes(normalizedSearchTerm)
          );
        }
      
        // Filtre de statut de paiement existant
        if (agentPaymentFilter !== 'all') {
          result = result.filter(agent => agentPaymentFilter === 'paid'
            ? agent.dejaPaye === true
            : agent.dejaPaye === false || agent.dejaPaye === undefined
          );
        }
        
        // Appliquer le filtre de date selon le mode
        if (dateFilterActive) {
          if (dateFilterMode === 'single' && selectedDate) {
            result = filterAgentsByDate(result, selectedDate, dateFilterType);
          } else if (dateFilterMode === 'range' && dateRange.from && dateRange.to) {
            result = filterAgentsByDateRange(result, dateRange, dateFilterType);
          }
        }
      
        setFilteredAgents(result);
        setAgentPage(1);
      }, [
        agentSearchTerm, 
        agentPaymentFilter, 
        agents, 
        selectedDate, 
        dateRange, 
        dateFilterActive, 
        dateFilterType,
        dateFilterMode
      ]);
      const resetDateFilters = () => {
        setSelectedDate(null);
        setDateRange({ from: null, to: null });
        setDateFilterActive(false);
        setDateFilterType('all');
        setStep('from');
      };
      const handleSingleDateSelection = (date, filterType = 'all') => {
        setSelectedDate(date);
        setDateFilterType(filterType);
        setDateFilterActive(true);
      };
      const handleDateSelection = (date, filterType) => {
        setSelectedDate(date);
        setDateFilterType(filterType);
        setDateFilterActive(true);
      };
      const handleRangeDateSelection = (date) => {
        if (step === 'from') {
          setDateRange({ from: date, to: null });
          setStep('to');
        } else {
          // Vérifie si date est avant dateRange.from
          if (isBefore(date, dateRange.from)) {
            setDateRange({ from: date, to: dateRange.from });
          } else {
            setDateRange({ ...dateRange, to: date });
          }
          setStep('from');
        }
      };
      
      // Composant de calendrier à ajouter juste avant la barre de recherche des agents
      const DateFilterComponent = () => {
        const today = new Date();
        const [currentMonth, setCurrentMonth] = useState(today);
        
        // Premier jour du mois en cours et autres calculs comme avant
        const firstDayCurrentMonth = startOfMonth(currentMonth);
        const lastDayCurrentMonth = endOfMonth(currentMonth);
        const firstDayCalendar = startOfWeek(firstDayCurrentMonth);
        const lastDayCalendar = endOfWeek(lastDayCurrentMonth);
        const days = eachDayOfInterval({
          start: firstDayCalendar,
          end: lastDayCalendar
        });
        const isDateInRange = (day) => {
            if (!dateRange.from || !dateRange.to) return false;
            const start = dateRange.from < dateRange.to ? dateRange.from : dateRange.to;
            const end = dateRange.from < dateRange.to ? dateRange.to : dateRange.from;
            return isWithinInterval(day, { start, end });
          };
          const getButtonTitle = () => {
            // Même logique que précédemment
            if (!dateFilterActive) {
              return "Filtrer par date...";
            }
            
            if (dateFilterMode === 'single' && selectedDate) {
              return `${formatDate(selectedDate, "dd/MM/yyyy")} ${dateFilterType !== 'all' ? `(${dateFilterType === 'paid' ? 'Payés' : 'À Payer'})` : ''}`;
            }
            
            if (dateFilterMode === 'range' && dateRange.from && dateRange.to) {
              return `${formatDate(dateRange.from, "dd/MM/yyyy")} - ${formatDate(dateRange.to, "dd/MM/yyyy")} ${dateFilterType !== 'all' ? `(${dateFilterType === 'paid' ? 'Payés' : 'À Payer'})` : ''}`;
            }
            
            if (dateFilterMode === 'range' && dateRange.from && !dateRange.to) {
              return `Du ${formatDate(dateRange.from, "dd/MM/yyyy")} au...`;
            }
            
            return "Filtrer par date...";
          };
          const handleSingleDateSelection = (date, filterType = 'all') => {
            setSelectedDate(date);
            setDateFilterType(filterType);
            setDateFilterActive(true);
            // Fermer le calendrier après la sélection en mode date unique
            setIsCalendarOpen(false);
          };
          const handleRangeDateSelection = (date) => {
            if (step === 'from') {
              setDateRange({ from: date, to: null });
              setStep('to');
              // Ne pas fermer le calendrier, rester ouvert pour la sélection de la date de fin
            } else {
              // Vérifie si date est avant dateRange.from
              if (isBefore(date, dateRange.from)) {
                setDateRange({ from: date, to: dateRange.from });
              } else {
                setDateRange({ ...dateRange, to: date });
              }
              
              // Préparer pour la prochaine utilisation
              setStep('from');
              
              // Activer le filtre mais ne pas fermer le calendrier encore
              // L'utilisateur devra cliquer sur "Appliquer" pour fermer
            }
          };
          const applyFilter = () => {
            setDateFilterActive(true);
            setIsCalendarOpen(false);
          };

          return (
            <div className="flex items-center space-x-2">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={dateFilterActive ? "default" : "outline"}
                    className={cn(
                      "justify-start text-left font-normal w-[280px]",
                      dateFilterActive && "bg-orange-500 text-white hover:bg-orange-600"
                    )}
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {getButtonTitle()}
                    {dateFilterActive && <X 
                      className="ml-auto h-4 w-4 cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        resetDateFilters();
                      }}
                    />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="space-y-3 p-3">
                    {/* Onglets pour choisir entre date unique et intervalle */}
                    <Tabs 
                      defaultValue={dateFilterMode} 
                      value={dateFilterMode}
                      onValueChange={(value) => {
                        setDateFilterMode(value);
                        resetDateFilters();
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="single">Date unique</TabsTrigger>
                        <TabsTrigger value="range">Intervalle</TabsTrigger>
                      </TabsList>
                      
                      <div className="mt-3">
                        {/* Navigation du mois */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1))}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <div className="font-medium">
                            {formatDate(currentMonth, 'MMMM yyyy')}
                          </div>
                          <button
                            onClick={() => setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1))}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {/* Jours de la semaine */}
                        <div className="grid grid-cols-7 text-center text-xs leading-6 text-gray-500 mt-2">
                          <div>D</div>
                          <div>L</div>
                          <div>M</div>
                          <div>M</div>
                          <div>J</div>
                          <div>V</div>
                          <div>S</div>
                        </div>
        
                        {/* Affichage des jours du calendrier */}
                        <div className="grid grid-cols-7 text-sm mt-1">
                          {days.map((day, dayIdx) => (
                            <div
                              key={day.toString()}
                              className={cn(
                                "py-2 focus:z-10",
                                dayIdx === 0 && `col-start-${day.getDay() + 1}`,
                                // Pour le mode date unique
                                dateFilterMode === 'single' && isEqual(day, selectedDate) && 
                                  "bg-orange-500 text-white rounded-md",
                                // Pour le mode intervalle
                                dateFilterMode === 'range' && isEqual(day, dateRange.from) && 
                                  "bg-orange-500 text-white rounded-l-md",
                                dateFilterMode === 'range' && isEqual(day, dateRange.to) && 
                                  "bg-orange-500 text-white rounded-r-md",
                                dateFilterMode === 'range' && !isEqual(day, dateRange.from) && 
                                  !isEqual(day, dateRange.to) && isDateInRange(day) && 
                                  "bg-orange-100 text-orange-600",
                                // Styling commun
                                !isEqual(day, dateFilterMode === 'single' ? selectedDate : dateRange.from) && 
                                  !isEqual(day, dateRange.to) && 
                                  !isDateInRange(day) && 
                                  isToday(day) && "bg-gray-100 text-gray-900 font-semibold",
                                !isEqual(day, dateFilterMode === 'single' ? selectedDate : dateRange.from) && 
                                  !isEqual(day, dateRange.to) && 
                                  !isDateInRange(day) && 
                                  !isToday(day) && isSameMonth(day, currentMonth) && "text-gray-900",
                                !isEqual(day, dateFilterMode === 'single' ? selectedDate : dateRange.from) && 
                                  !isEqual(day, dateRange.to) && 
                                  !isDateInRange(day) && 
                                  !isToday(day) && !isSameMonth(day, currentMonth) && "text-gray-400"
                              )}
                            >
                              <TabsContent value="single" className="m-0 p-0">
                                <div className="relative">
                                  <div className="mx-auto flex items-center justify-center h-8 w-8 relative">
                                    <button
                                      type="button"
                                      className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                      onClick={() => handleSingleDateSelection(day, 'all')}
                                    >
                                      {formatDate(day, 'd')}
                                    </button>
                                    <div className="absolute -bottom-5 left-0 right-0 flex justify-center space-x-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSingleDateSelection(day, 'paid');
                                        }}
                                        className="h-2 w-2 rounded-full bg-green-500 hover:bg-green-600 transition-all transform hover:scale-125"
                                        title="Payés à cette date"
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSingleDateSelection(day, 'unpaid');
                                        }}
                                        className="h-2 w-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-all transform hover:scale-125"
                                        title="À payer à cette date"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="range" className="m-0 p-0">
                                <button
                                  type="button"
                                  className={cn(
                                    "mx-auto flex h-8 w-8 items-center justify-center rounded-md",
                                    (isEqual(day, dateRange.from) || isEqual(day, dateRange.to)) && 
                                      "bg-orange-500 text-white",
                                    isDateInRange(day) && "hover:bg-orange-200",
                                    !isDateInRange(day) && "hover:bg-gray-100"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Empêcher la fermeture du popover
                                    handleRangeDateSelection(day);
                                  }}
                                >
                                  {formatDate(day, 'd')}
                                </button>
                              </TabsContent>
                            </div>
                          ))}
                        </div>
                        
                        {/* Filtres de type de paiement pour l'intervalle */}
                        <TabsContent value="range" className="mt-3 pt-2 border-t">
                          {dateRange.from && dateRange.to && (
                            <>
                              <div className="flex justify-around">
                                <button
                                  onClick={() => setDateFilterType('all')}
                                  className={`px-3 py-1 rounded-md text-sm ${dateFilterType === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                  Tous
                                </button>
                                <button
                                  onClick={() => setDateFilterType('paid')}
                                  className={`px-3 py-1 rounded-md text-sm ${dateFilterType === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                  Payés
                                </button>
                                <button
                                  onClick={() => setDateFilterType('unpaid')}
                                  className={`px-3 py-1 rounded-md text-sm ${dateFilterType === 'unpaid' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                  À Payer
                                </button>
                              </div>
                              
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={applyFilter}
                                  className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
                                >
                                  Appliquer
                                </button>
                              </div>
                            </>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-2">
                            {step === 'from' ? 
                              "Sélectionnez la date de début" : 
                              "Sélectionnez la date de fin"}
                          </div>
                        </TabsContent>
                        
                        {/* Légende pour le mode date unique */}
                        <TabsContent value="single" className="mt-3 pt-2 border-t">
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span>Agents déjà payés</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span>Agents à payer</span>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        };
    // Filtre les clients
    useEffect(() => {
        let result = [...clients];

        if (clientSearchTerm.trim() !== '') {
            const normalizedSearchTerm = clientSearchTerm.toLowerCase().trim();
            result = result.filter(client =>
                client.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                client.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                client.email?.toLowerCase().includes(normalizedSearchTerm) ||
                client.telephone?.includes(normalizedSearchTerm)
            );
        }

        if (clientPaymentFilter !== 'all') {
            result = result.filter(client => clientPaymentFilter === 'paid'
                ? client.aDejaPaye === true
                : client.aDejaPaye === false || client.aDejaPaye === undefined
            );
        }

        setFilteredClients(result);
        setClientPage(1);
    }, [clientSearchTerm, clientPaymentFilter, clients]);

    // Filtre les services
    useEffect(() => {
        if (serviceSearchTerm.trim() === '') {
            setFilteredServices(services);
        } else {
            const normalizedSearchTerm = serviceSearchTerm.toLowerCase().trim();
            const result = services.filter(service =>
                service.nomService?.toLowerCase().includes(normalizedSearchTerm) ||
                (service.description && service.description.toLowerCase().includes(normalizedSearchTerm))
            );
            setFilteredServices(result);
        }
        setServicePage(1);
    }, [serviceSearchTerm, services]);

    // Calculs de pagination pour les agents
    const agentTotalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
    const agentStartIndex = (agentPage - 1) * ITEMS_PER_PAGE;
    const displayedAgents = filteredAgents.slice(agentStartIndex, agentStartIndex + ITEMS_PER_PAGE);

    // Calculs de pagination pour les clients
    const clientTotalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
    const clientStartIndex = (clientPage - 1) * ITEMS_PER_PAGE;
    const displayedClients = filteredClients.slice(clientStartIndex, clientStartIndex + ITEMS_PER_PAGE);

    // Calculs de pagination pour les services
    const serviceTotalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    const serviceStartIndex = (servicePage - 1) * ITEMS_PER_PAGE;
    const displayedServices = filteredServices.slice(serviceStartIndex, serviceStartIndex + ITEMS_PER_PAGE);

    // Gestion des événements et mise à jour
    const handleServiceClick = (service) => {
        setSelectedService(service);
        setIsServiceDialogOpen(true);
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setIsClientDialogOpen(true);
    };

    const handleAgentClick = (agent) => {
        setSelectedAgent(agent);
        setIsAgentDialogOpen(true);
    };

    const handleUpdateClient = async (updatedClient) => {
        try {
            if (!updatedClient || !updatedClient._id) {
                toast.error("Données du client invalides");
                return { type: 'error', error: "Données du client invalides" };
            }

            const clientData = {
                ...updatedClient,
                clientId: updatedClient._id,
                entrepriseId: entrepriseId,
                serviceId: updatedClient.servicesChoisis?.[0]?._id
            };

            const result = await updateClient(clientData);
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    };

    const handleUpdateAgent = async (updateAgent) => {
        try {
            if (!updateAgent || !updateAgent._id) {
                toast.error("Données de l'agent invalides");
                return { type: 'error', error: "Données de l'agent invalides" };
            }

            const agentData = {
                ...updateAgent,
                agentId: updateAgent._id,
                entrepriseId: entrepriseId,
            };

            const result = await updatedAgent(agentData);
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    };

    const handleUpdateGerant = async (updatedAgent) => {
        try {
            if (!updatedAgent || !updatedAgent._id) {
                toast.error("Données du gérant invalides");
                return { type: 'error', error: "Données du gérant invalides" };
            }

            const gerantData = {
                ...updatedAgent,
                agentId: updatedAgent._id,
                entrepriseId: entrepriseId,
            };

            const result = await updatedGerant(gerantData);
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    };

    const handleUpdateService = (updatedService) => {
        //console.log("Updating service:", updatedService);
        setIsServiceDialogOpen(false);
    };

    const handleVerifyClientOtp = async (formData) => {
        try {
            const { code, pendingChangeId } = formData;

            if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
                return {
                    type: 'error',
                    error: "Le code OTP doit contenir exactement 6 chiffres"
                };
            }

            const changeId = String(pendingChangeId);
            const result = await validateOTP(changeId, code, entrepriseId);

            if (result && result.success) {
                return {
                    type: 'success',
                    message: result.data?.message || "Validation réussie"
                };
            } else {
                let errorMsg = "Échec de la vérification OTP";

                if (result?.error) {
                    errorMsg = result.error;
                } else if (result?.errors) {
                    if (result.errors.otp && result.errors.otp.length > 0) {
                        errorMsg = result.errors.otp[0];
                    } else if (result.errors.pendingChangeId && result.errors.pendingChangeId.length > 0) {
                        errorMsg = result.errors.pendingChangeId[0];
                    }
                }

                return { type: 'error', error: errorMsg };
            }
        } catch (error) {
            return {
                type: 'error',
                error: error.message || "Échec de la vérification OTP"
            };
        }
    };

    const handleRemoveFromService = async (formData) => {
        try {
            return await removeClientFromService(formData);
        } catch (error) {
            toast.error('Une erreur est survenue lors du retrait du service');
            return null;
        }
    };

    const handleDeleteClient = async (formData) => {
        try {
            return await deleteClient(formData);
        } catch (error) {
            return null;
        }
    };

    const handleDeleteAgent = async (formData) => {
        try {
            return await deleteAgent(formData);
        } catch (error) {
            return null;
        }
    };

    const handleSendMessage = () => {
        if (!messageTitle.trim() || !messageContent.trim()) {
            toast.error("Veuillez remplir tous les champs du message");
            return;
        }

        toast.success("Message envoyé avec succès");
        setMessageTitle('');
        setMessageContent('');
    };

    // Fonction pour la pagination
    const renderPagination = (currentPage, totalPages, setPage) => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center gap-2">
            {/* Bouton précédent */}
            <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-16 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
            >
                <ChevronLeft size={20} />
            </button>
            
            {/* Affichage des numéros de page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                    <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg ${
                            currentPage === pageNum
                                ? "bg-orange-400 text-white"
                                : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {pageNum}
                    </button>
                );
            })}
            
            {/* Bouton suivant */}
            <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-16 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

    return (
        <div className="p-2 ">
            <Toaster position="top-center" />

    

            <div className="grid grid-cols-1 md:grid-cols-4 md:w-[900px] w-[500px] gap-5 mb-6">
                <div className="bg-white p-9 rounded-md shadow-xl">
                    <h3 className="text-lg font-semibold">Total Agents</h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-3xl font-bold text-[#0cadec]">{agents.length}</p>
                        <CreateAgentModal services={services} entrepriseId={entrepriseId}>
                           
                        </CreateAgentModal>
                    </div>
                </div>

                <div className="bg-white p-9 rounded-md shadow-xl">
                    <h3 className="text-lg font-semibold">Total Clients</h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-3xl font-bold text-[#0cadec]">{clients.length}</p>
                        <CreateClientModal services={services} entrepriseId={entrepriseId}>
                           
                        </CreateClientModal>
                    </div>
                </div>

                <div className="bg-white p-9 rounded-md shadow-xl">
                    <h3 className="text-lg font-semibold">Total Services</h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-3xl font-bold text-[#0cadec]">{services.length}</p>
                        <CreateServiceModal enterprises={[{ _id: entrepriseId, nomEntreprise }]}>
                          
                        </CreateServiceModal>
                    </div>
                </div>

                <div className="bg-white p-9 rounded-md shadow-xl">
                    <h3 className="text-lg font-semibold">Total Gerants</h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-3xl font-bold text-[#0cadec]">{gerants.length}</p>
                        <CreateGerantModal  enterprises={[{ _id: entrepriseId, nomEntreprise }]} >
                           
                        </CreateGerantModal>
                    </div>
                </div>

            </div>

            {/* Section principale avec les listes et la messagerie */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
                <div className="lg:col-span-3 space-y-6">
                    {/* Liste des Agents */}
                    <div className='flex justify-between items-center'>
  <h2 className="text-xl font-semibold text-blue-500">Liste des Agents</h2>
  <div className="flex space-x-2 items-center">
    {/* Filtre de date combiné */}
    <DateFilterComponent />
    
    {/* Filtre de recherche existant */}
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder="Rechercher un agent"
        className="pl-10 w-52 bg-white border border-gray-200"
        value={agentSearchTerm}
        onChange={(e) => setAgentSearchTerm(e.target.value)}
      />
    </div>

    {/* Filtre de paiement existant */}
    <Select
      value={agentPaymentFilter}
      onValueChange={(value) => setAgentPaymentFilter(value)}
    >
      <SelectTrigger className="w-40 bg-white border border-gray-200">
        <SelectValue>
          {agentPaymentFilter === 'all' && 'Tout les Agents'}
          {agentPaymentFilter === 'paid' && 'Deja Payés'}
          {agentPaymentFilter === 'unpaid' && 'À Payés'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous</SelectItem>
        <SelectItem value="paid">Deja Payés</SelectItem>
        <SelectItem value="unpaid">À Payés</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
                    <div className="bg-white p-4 rounded-lg shadow-xl">
                        <div className="flex items-center justify-between mb-4">

                        </div>

                        {/* Tableau des agents */}
                        {displayedAgents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom(s)</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom(s)</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {displayedAgents.map((agent) => (
                                            <tr
                                                key={agent._id}
                                                onClick={() => handleAgentClick(agent)}
                                                className="cursor-pointer hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 uppercase">{agent.nom || "IPSUM"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{agent.prenom || "Lorem"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{agent.email || "ip.lorem@gmail.com"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{agent.telephone || "778282828"}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {agent.servicesAffecte && agent.servicesAffecte.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {agent.servicesAffecte.map((service, index) => (
                                                                <Badge key={index} variant="secondary" className="bg-gray-100">
                                                                    {service.nomService || "Hello Word"}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Hello Word</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{agent.role || "Word"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge className={agent.dejaPaye ? "bg-[#10C400] text-white" : "bg-[#6F7BFF] text-white"}>
                                                        {agent.dejaPaye ? "Deja Payés" : "À Payés"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {agentSearchTerm ?
                                    "Aucun agent ne correspond à votre recherche" :
                                    agentPaymentFilter !== 'all' ?
                                        `Aucun agent ${agentPaymentFilter === 'paid' ? 'Deja Payés' : 'À Payés'} trouvé` :
                                        "Aucun agent trouvé"
                                }
                            </div>
                        )}

                        {/* Pagination des agents */}
                        {renderPagination(agentPage, agentTotalPages, setAgentPage)}
                    </div>

                    {/* Liste des Clients */}
                    <div className='flex justify-between '>
                        <h2 className="text-xl font-semibold text-blue-500">Liste des Clients</h2>

                        <div className="flex space-x-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Rechercher un client"
                                    className="pl-10 w-52 bg-white border border-gray-200"
                                    value={clientSearchTerm}
                                    onChange={(e) => setClientSearchTerm(e.target.value)}
                                />
                            </div>

                            <Select
                                value={clientPaymentFilter}
                                onValueChange={(value) => setClientPaymentFilter(value)}
                            >
                                <SelectTrigger className="w-40 bg-white border border-gray-200">
                                    <SelectValue>
                                        {clientPaymentFilter === 'all' && 'Tout les clients'}
                                        {clientPaymentFilter === 'paid' && 'Déjà Reçus'}
                                        {clientPaymentFilter === 'unpaid' && 'Non Reçus'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tout les clients</SelectItem>
                                    <SelectItem value="paid">Déjà Reçus</SelectItem>
                                    <SelectItem value="unpaid">Non Reçus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                        </div>

                        {/* Tableau des clients */}
                        {displayedClients.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom(s)</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom(s)</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {displayedClients.map((client) => (
                                            <tr
                                                key={client._id}
                                                onClick={() => handleClientClick(client)}
                                                className="cursor-pointer hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 uppercase">{client.nom}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.prenom}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{client.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{client.telephone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {client.servicesChoisis && client.servicesChoisis.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {client.servicesChoisis.map((service, index) => (
                                                                <Badge key={index} variant="secondary" className="bg-gray-100">
                                                                    {service.nomService}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500"></span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">Client</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge className={client.aDejaPaye ? "bg-[#10C400] text-white" : "bg-[#6F7BFF] text-white"}>
                                                        {client.aDejaPaye ? "Déjà Reçus" : "Non Reçus"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {clientSearchTerm ?
                                    "Aucun client ne correspond à votre recherche" :
                                    clientPaymentFilter !== 'all' ?
                                        `Aucun client ${clientPaymentFilter === 'paid' ? 'Déjà Reçus' : 'Non Reçus'} trouvé` :
                                        "Aucun client trouvé"
                                }
                            </div>
                        )}

                        {/* Pagination des clients */}
                        {renderPagination(clientPage, clientTotalPages, setClientPage)}
                    </div>
                </div>

                {/* Panneau latéral avec services et messagerie */}
                <div className='mt-[-175px] space-y-6 lg:w-[300px] '>
                    <div className="col-span-1">
                        <BalanceEntreprise balances={balance} />
                    </div>
                    <div className="space-y-6">

                        {/* Liste des Services */}
                        <div className="bg-white p-4 rounded-lg  shadow-xl">
                            <h2 className="text-xl font-semibold text-blue-500 mb-4">Liste des Services</h2>

                            {/* Barre de recherche pour les services */}
                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Rechercher un service"
                                    className="pl-10 w-full bg-white border border-gray-200"
                                    value={serviceSearchTerm}
                                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Tableau des services */}
                            {displayedServices.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom(s)</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarif</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gérant(s)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {displayedServices.map((service) => (
                                                <tr
                                                    key={service._id}
                                                    onClick={() => handleServiceClick(service)}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 uppercase">{service.nomService || "IPSUM"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{service.tarif || "Lorem"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {service.gerants && service.gerants.length > 0
                                                                ? service.gerants.map(gerant => `${gerant.nom} ${gerant.prenom}`).join(', ')
                                                                : "IPSUM Lorem"
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {serviceSearchTerm ?
                                        "Aucun service ne correspond à votre recherche" :
                                        "Aucun service trouvé"
                                    }
                                </div>
                            )}

                            {/* Pagination des services */}
                            {renderPagination(servicePage, serviceTotalPages, setServicePage)}
                        </div>

                        {/* Messagerie */}

                    </div>
                </div>
            </div>

            {/* Dialogs pour chaque type d'entité */}
            <ServiceDialog
                service={selectedService}
                isOpen={isServiceDialogOpen}
                onClose={() => setIsServiceDialogOpen(false)}
                onUpdate={handleUpdateService}
            />

            <ClientDialog
                client={selectedClient}
                entrepriseId={entrepriseId}
                isOpen={isClientDialogOpen}
                onClose={() => setIsClientDialogOpen(false)}
                onUpdate={handleUpdateClient}
                onDelete={handleDeleteClient}
                onRemoveFromService={handleRemoveFromService}
                verifyOtp={handleVerifyClientOtp}
            />

            <AgentDialog
                agent={selectedAgent}
                isOpen={isAgentDialogOpen}
                onClose={() => setIsAgentDialogOpen(false)}
                onUpdate={handleUpdateAgent}
                onDelete={handleDeleteAgent}
                verifyOtp={handleVerifyClientOtp}
                entrepriseId={entrepriseId}
            />

            <GerantDialog
                gerant={selectedGerant}
                isOpen={isGerantDialogOpen}
                entrepriseId={entrepriseId}
                onClose={() => setIsGerantDialogOpen(false)}
                onUpdate={handleUpdateGerant}
                onDelete={handleDeleteClient}
                verifyOtp={handleVerifyClientOtp}
            />
        </div>
    );
};

export default CombinedView;