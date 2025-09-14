import React from 'react';
import TableView from './TableView';
import SearchFilter from './SearchFilter';
import useTableData from '../Hooks/useTableData';

const ServicesList = ({ services, onServiceClick }) => {
  const {
    displayedData: displayedServices,
    page: servicePage,
    setPage: setServicePage,
    totalPages: serviceTotalPages,
    searchTerm: serviceSearchTerm,
    setSearchTerm: setServiceSearchTerm,
  } = useTableData(services, {
    itemsPerPage: 6
  });

  const serviceColumns = [
    {
      header: "Nom(s)",
      field: "nomService",
      cellClassName: "text-sm font-medium text-gray-900 uppercase",
      defaultValue: "IPSUM"
    },
    {
      header: "Tarif",
      cellClassName: "text-sm text-gray-600",
      defaultValue: "Lorem",
      render: (service) => (
        <div className="text-sm text-gray-600">
          {service.niveauxDisponibles && service.niveauxDisponibles.length > 0 ? (
            service.niveauxDisponibles.map((niv, idx) => (
              <div key={idx}>
                {niv.nom}: {niv.tarif} FCFA
              </div>
            ))
          ) : (
            <span>Lorem</span>
          )}
        </div>
      ),
    },
    {
      header: "Gérant(s)",
      render: (service) => (
        <div className="text-sm text-gray-600">
          {service.gerants && service.gerants.length > 0
            ? service.gerants.map(gerant => `${gerant.nom} ${gerant.prenom}`).join(', ')
            : "IPSUM Lorem"
          }
        </div>
      )
    }
  ];

  const getEmptyMessage = () => {
    if (serviceSearchTerm) {
      return "Aucun service ne correspond à votre recherche";
    }
    return "Aucun service trouvé";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#00BFFF]">Liste des Services</h2>
        <SearchFilter 
          searchTerm={serviceSearchTerm}
          onSearchChange={setServiceSearchTerm}
          searchPlaceholder="Rechercher"
          className="max-w-[200px]"
        />
      </div>

      <TableView 
        data={displayedServices}
        columns={serviceColumns}
        onRowClick={onServiceClick}
        currentPage={servicePage}
        totalPages={serviceTotalPages}
        onPageChange={setServicePage}
        emptyMessage={getEmptyMessage()}
        className="border-t-0"
      />
    </div>
  );
};

export default ServicesList;