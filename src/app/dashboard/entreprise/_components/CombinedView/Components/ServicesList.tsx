import React from 'react';
import TableView from './TableView';
import SearchFilter from './SearchFilter';
import useTableData from '../Hooks/useTableData';


const ServicesList = ({ services, onServiceClick }) => {
  // Hook pour le tableau et le filtrage
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

  // Colonnes du tableau
  const serviceColumns = [
    {
      header: "Nom(s)",
      field: "nomService",
      cellClassName: "text-sm font-medium text-gray-900 uppercase",
      defaultValue: "IPSUM"
    },
  {
  header: "Tarif",
  
  cellClassName: "text-sm text-gray-500",
  defaultValue: "Aucun tarif disponible",
  render: (service) => (
    <div className="space-y-1">
  {service.niveauxDisponibles && service.niveauxDisponibles.length > 0 ? (
    service.niveauxDisponibles.map((niv, idx) => (
      <div key={idx} className="flex justify-between">
        <span className="font-medium">{niv.nom} :</span>
        <span>{niv.tarif} FCFA</span>
      </div>
    ))
  ) : (
    <span className="italic text-gray-400">Aucun tarif</span>
  )}
</div>

  ),
},

    {
      header: "Gérant(s)",
      render: (service) => (
        <div className="text-sm text-gray-500">
          {service.gerants && service.gerants.length > 0
            ? service.gerants.map(gerant => `${gerant.nom} ${gerant.prenom}`).join(', ')
            : "IPSUM Lorem"
          }
        </div>
      )
    }
  ];

  // Message d'erreur personnalisé pour les données vides
  const getEmptyMessage = () => {
    if (serviceSearchTerm) {
      return "Aucun service ne correspond à votre recherche";
    }
    return "Aucun service trouvé";
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold text-blue-500 mb-4">Liste des Services</h2>
      
      {/* Filtre de recherche */}
      <div className="mb-4">
        <SearchFilter 
          searchTerm={serviceSearchTerm}
          onSearchChange={setServiceSearchTerm}
          searchPlaceholder="Rechercher un service"
          className="justify-start"
        />
      </div>

      {/* Tableau des services */}
      <TableView 
        data={displayedServices}
        columns={serviceColumns}
        onRowClick={onServiceClick}
        currentPage={servicePage}
        totalPages={serviceTotalPages}
        onPageChange={setServicePage}
        emptyMessage={getEmptyMessage()}
      />
    </div>
  );
};

export default ServicesList;