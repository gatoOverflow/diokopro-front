import React, { useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameMonth, isEqual, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const DateFilterComponent = ({
  dateFilterMode,
  setDateFilterMode,
  selectedDate,
  dateRange,
  dateFilterActive,
  dateFilterType,
  step,
  isCalendarOpen,
  setIsCalendarOpen,
  resetDateFilters,
  handleSingleDateSelection,
  handleRangeDateSelection,
  applyFilter,
  setDateFilterType  
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  
  // Formatage de date - optimisé avec useCallback
  const formatDate = useCallback((date, formatStr) => {
    if (!date) return "";
    return format(date, formatStr, { locale: fr });
  }, []);

  // Vérifier si une date est dans l'intervalle - optimisé avec useCallback
  const isDateInRange = useCallback((day) => {
    if (!dateRange.from || !dateRange.to) return false;
    const start = dateRange.from < dateRange.to ? dateRange.from : dateRange.to;
    const end = dateRange.from < dateRange.to ? dateRange.to : dateRange.from;
    return isWithinInterval(day, { start, end });
  }, [dateRange.from, dateRange.to]);

  // Obtenir le titre du bouton - optimisé avec useCallback
  const getButtonTitle = useCallback(() => {
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
  }, [dateFilterActive, dateFilterMode, selectedDate, dateRange.from, dateRange.to, dateFilterType, formatDate]);

  // Calculs pour le calendrier - memoïsés
  const calendarDays = React.useMemo(() => {
    const firstDayCurrentMonth = startOfMonth(currentMonth);
    const lastDayCurrentMonth = endOfMonth(currentMonth);
    const firstDayCalendar = startOfWeek(firstDayCurrentMonth);
    const lastDayCalendar = endOfWeek(lastDayCurrentMonth);
    return eachDayOfInterval({
      start: firstDayCalendar,
      end: lastDayCalendar
    });
  }, [currentMonth]);

  // Gestionnaire pour les changements de mois
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1));
  }, []);

  // Gestionnaire pour les clics sur X (réinitialisation)
  const handleResetClick = useCallback((e) => {
    e.stopPropagation();
    resetDateFilters();
  }, [resetDateFilters]);

  // Gestionnaires pour les types de filtres
  const handleSetFilterAll = useCallback(() => {
    if (setDateFilterType) setDateFilterType('all');
  }, [setDateFilterType]);

  const handleSetFilterPaid = useCallback(() => {
    if (setDateFilterType) setDateFilterType('paid');
  }, [setDateFilterType]);

  const handleSetFilterUnpaid = useCallback(() => {
    if (setDateFilterType) setDateFilterType('unpaid');
  }, [setDateFilterType]);

  // Gestionnaire pour l'ouverture du calendrier
  const handleCalendarOpen = useCallback(() => {
    setIsCalendarOpen(true);
  }, [setIsCalendarOpen]);

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
            onClick={handleCalendarOpen}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {getButtonTitle()}
            {dateFilterActive && <X 
              className="ml-auto h-4 w-4 cursor-pointer" 
              onClick={handleResetClick}
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
                    onClick={handlePrevMonth}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="font-medium">
                    {formatDate(currentMonth, 'MMMM yyyy')}
                  </div>
                  <button
                    onClick={handleNextMonth}
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
                  {calendarDays.map((day, dayIdx) => (
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
                          onClick={handleSetFilterAll}
                          className={`px-3 py-1 rounded-md text-sm ${dateFilterType === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          Tous
                        </button>
                        <button
                          onClick={handleSetFilterPaid}
                          className={`px-3 py-1 rounded-md text-sm ${dateFilterType === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          Payés
                        </button>
                        <button
                          onClick={handleSetFilterUnpaid}
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

// Utiliser React.memo pour éviter les re-rendus inutiles
export default React.memo(DateFilterComponent);