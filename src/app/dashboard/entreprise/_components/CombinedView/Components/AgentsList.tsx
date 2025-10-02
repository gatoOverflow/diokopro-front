// AgentsList.tsx
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import TableView from './TableView';
import SearchFilter from './SearchFilter';
import DateFilterComponent from './DateFilterComponent';
import useDateFilter from '../Hooks/useDateFilter';
import useTableData from '../Hooks/useTableData';

const AgentsList = ({ agents, onAgentClick }) => {
  const dateFilter = useDateFilter();
  
  const dateFilteredAgents = useMemo(() => {
    if (!dateFilter.dateFilterActive) {
      return agents;
    }
    
    let result = [...agents];
    
    if (dateFilter.dateFilterMode === 'single' && dateFilter.selectedDate) {
      result = dateFilter.filterItemsByDate(
        result, 
        dateFilter.selectedDate, 
        dateFilter.dateFilterType,
        'virementsRecus',
        'virementsRecus',
        'dateProchainVirement'
      );
    } else if (dateFilter.dateFilterMode === 'range' && dateFilter.dateRange.from && dateFilter.dateRange.to) {
      result = dateFilter.filterItemsByDateRange(
        result, 
        dateFilter.dateRange, 
        dateFilter.dateFilterType,
        'virementsRecus',
        'virementsRecus',
        'dateProchainVirement'
      );
    }
    
    return result;
  }, [
    agents,
    dateFilter.dateFilterActive,
    dateFilter.dateFilterMode,
    dateFilter.selectedDate,
    dateFilter.dateRange,
    dateFilter.dateFilterType,
    dateFilter.filterItemsByDate,
    dateFilter.filterItemsByDateRange
  ]);

  const {
    displayedData: displayedAgents,
    page: agentPage,
    setPage: setAgentPage,
    totalPages: agentTotalPages,
    searchTerm: agentSearchTerm,
    setSearchTerm: setAgentSearchTerm,
    filterValue: agentPaymentFilter,
    setFilterValue: setAgentPaymentFilter,
  } = useTableData(dateFilteredAgents, {
    itemsPerPage: 6,
    filterField: { field: 'dejaPaye' }
  });

  const agentColumns = useMemo(() => [
    {
      header: "Nom(s)",
      field: "nom",
      cellClassName: "text-sm font-medium text-gray-900 uppercase",
      defaultValue: "IPSUM"
    },
    {
      header: "Prénom(s)",
      field: "prenom",
      cellClassName: "text-sm text-gray-700",
      defaultValue: "Lorem"
    },
    {
      header: "Email",
      field: "email",
      cellClassName: "text-sm text-gray-600",
      defaultValue: "ip.lorem@gmail.com"
    },
    {
      header: "Téléphone",
      field: "telephone",
      cellClassName: "text-sm text-gray-600",
      defaultValue: "778282828"
    },
    {
      header: "Services",
      render: (agent) => (
        agent.servicesAffecte && agent.servicesAffecte.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {agent.servicesAffecte.map((service, index) => (
              <span key={index} className="text-sm text-gray-600">
                {service.nomService}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-600">Hello Word</span>
        )
      )
    },
    {
      header: "Rôle",
      field: "role",
      cellClassName: "text-sm text-gray-600",
      defaultValue: "Word"
    },
    {
      header: "Fiche de Paie",
      render: (agent) => {
        if (agent.payslip) {
          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {agent.payslip.totalAmount ? `${agent.payslip.totalAmount.toLocaleString()} FCFA` : 'N/A'}
              </div>
              {agent.payslip.period && (
                <div className="text-xs text-gray-500">
                  {agent.payslip.period}
                </div>
              )}
            </div>
          );
        }
        return <span className="text-sm text-gray-400">Non disponible</span>;
      }
    }
  ], []);

  const paymentFilterOptions = useMemo(() => [
    { value: 'all', label: 'À Payer' },
    { value: 'true', label: 'Deja Payés' },
    { value: 'false', label: 'À Payés' }
  ], []);

  const getEmptyMessage = () => {
    if (agentSearchTerm) {
      return "Aucun agent ne correspond à votre recherche";
    }
    if (agentPaymentFilter !== 'all') {
      return `Aucun agent ${agentPaymentFilter === 'true' ? 'Deja Payés' : 'À Payés'} trouvé`;
    }
    if (dateFilter.dateFilterActive) {
      return "Aucun agent ne correspond aux critères de date sélectionnés";
    }
    return "Aucun agent trouvé";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-xl font-semibold text-[#00BFFF]">Liste des Agents</h2>
        <div className="flex space-x-2 items-center">
          <DateFilterComponent 
            dateFilterMode={dateFilter.dateFilterMode}
            setDateFilterMode={dateFilter.setDateFilterMode}
            selectedDate={dateFilter.selectedDate}
            dateRange={dateFilter.dateRange}
            dateFilterActive={dateFilter.dateFilterActive}
            dateFilterType={dateFilter.dateFilterType}
            step={dateFilter.step}
            isCalendarOpen={dateFilter.isCalendarOpen}
            setIsCalendarOpen={dateFilter.setIsCalendarOpen}
            resetDateFilters={dateFilter.resetDateFilters}
            handleSingleDateSelection={dateFilter.handleSingleDateSelection}
            handleRangeDateSelection={dateFilter.handleRangeDateSelection}
            applyFilter={dateFilter.applyFilter}
            setDateFilterType={dateFilter.setDateFilterType}
          />
          
          <SearchFilter 
            searchTerm={agentSearchTerm}
            onSearchChange={setAgentSearchTerm}
            filterValue={agentPaymentFilter}
            onFilterChange={setAgentPaymentFilter}
            filterOptions={paymentFilterOptions}
            searchPlaceholder="Rechercher un agent"
            className="max-w-xs"
          />
        </div>
      </div>

      <TableView 
        data={displayedAgents}
        columns={agentColumns}
        onRowClick={onAgentClick}
        currentPage={agentPage}
        totalPages={agentTotalPages}
        onPageChange={setAgentPage}
        emptyMessage={getEmptyMessage()}
        className="border-t-0"
      />
    </div>
  );
};

export default React.memo(AgentsList);