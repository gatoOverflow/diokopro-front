import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@radix-ui/react-label';

interface ServiceListProps {
  services: any[];
  totalServices: number;
  onServiceClick: (service: any) => void;
  searchTerm: string;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  totalServices,
  onServiceClick,
  searchTerm
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des services</h2>
        <Badge variant="outline" className="px-3 py-1">
          {totalServices} service(s)
        </Badge>
      </div>

      <Table>
        <TableCaption>Liste complète des services disponibles</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du service</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Tarif de base</TableHead>
            <TableHead>Gérants</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length > 0 ? (
            services.map((service) => (
              <TableRow
                key={service._id}
                onClick={() => onServiceClick(service)}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <TableCell className="font-medium">{service.nomService}</TableCell>
                <TableCell>{service.description || "-"}</TableCell>
                <TableCell>
                  {service.niveauxDisponibles.map((samm, index) => (
                    <div key={index} className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        {samm.nom} :
                      </Label>
                      <span className="col-span-3">
                        {samm.tarif} FCFA
                      </span>
                    </div>
                  ))}
                </TableCell>

                <TableCell>{service.gerants?.join(", ") || "-"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                {searchTerm ? "Aucun service ne correspond à votre recherche" : "Aucun service trouvé"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceList;