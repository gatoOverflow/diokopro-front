// components/client/ClientReferencesTab.tsx

import React from 'react';
import { Tag } from 'lucide-react';
import { Client } from '@/app/lib/types';


interface ClientReferencesTabProps {
  client: Client;
}

const ClientReferencesTab: React.FC<ClientReferencesTabProps> = ({ client }) => {
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Références</h3>
      
      {client.references && client.references.length > 0 ? (
        <div className="space-y-2">
          {client.references.map((reference, index) => (
            <div 
              key={index} 
              className="p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="font-medium mb-1">
                Référence #{index + 1}
              </div>
              {/* Affichage conditionnel basé sur le type de référence  okki*/}
              {typeof reference === 'string' ? (
                <div className="text-sm text-gray-600">{reference}</div>
              ) : typeof reference === 'object' && reference !== null ? (
                <div className="space-y-1">
                  {Object.entries(reference).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-700 capitalize">
                        {key}:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {String(reference)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
          <Tag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <div className="font-medium">Aucune référence</div>
          <div className="text-sm">Ce client n'a pas encore de références enregistrées</div>
        </div>
      )}
    </div>
  );
};

export default ClientReferencesTab;