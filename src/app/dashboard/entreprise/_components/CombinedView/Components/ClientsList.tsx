import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import TableView from './TableView';
import SearchFilter from './SearchFilter';
import useTableData from '../Hooks/useTableData';

const ClientsList = ({ clients, onClientClick }) => {
  const {
    displayedData: displayedClients,
    page: clientPage,
    setPage: setClientPage,
    totalPages: clientTotalPages,
    searchTerm: clientSearchTerm,
    setSearchTerm: setClientSearchTerm,
    filterValue: clientPaymentFilter,
    setFilterValue: setClientPaymentFilter,
  } = useTableData(clients, {
    itemsPerPage: 6,
    filterField: { field: 'aDejaPaye' }
  });

  const clientColumns = useMemo(() => [
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
      render: (client) => (
        client.servicesChoisis && client.servicesChoisis.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {client.servicesChoisis.map((service, index) => (
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
      render: () => <div className="text-sm text-gray-600">Word</div>
    }
  ], []);

  const paymentFilterOptions = useMemo(() => [
    { value: 'all', label: 'À faire Payer' },
    { value: 'true', label: 'Déjà Reçus' },
    { value: 'false', label: 'Non Reçus' }
  ], []);

  const getEmptyMessage = () => {
    if (clientSearchTerm) {
      return "Aucun client ne correspond à votre recherche";
    }
    if (clientPaymentFilter !== 'all') {
      return `Aucun client ${clientPaymentFilter === 'true' ? 'Déjà Reçus' : 'Non Reçus'} trouvé`;
    }
    return "Aucun client trouvé";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className='flex justify-between mb-4'>
        <h2 className="text-xl font-semibold text-[#00BFFF]">Liste des Clients</h2>
        <SearchFilter 
          searchTerm={clientSearchTerm}
          onSearchChange={setClientSearchTerm}
          filterValue={clientPaymentFilter}
          onFilterChange={setClientPaymentFilter}
          filterOptions={paymentFilterOptions}
          searchPlaceholder="Rechercher un agent"
          className="max-w-xs"
        />
      </div>

      <TableView 
        data={displayedClients}
        columns={clientColumns}
        onRowClick={onClientClick}
        currentPage={clientPage}
        totalPages={clientTotalPages}
        onPageChange={setClientPage}
        emptyMessage={getEmptyMessage()}
        className="border-t-0"
      />
    </div>
  );
};

export default React.memo(ClientsList);