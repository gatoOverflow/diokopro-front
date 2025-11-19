import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface GerantListProps {
  agents: any[];
  totalGerants: number;
  onGerantClick: (gerant: any) => void;
  searchTerm: string;
}

const AllEntreprise: React.FC<GerantListProps> = ({ 
  agents = [], 
  totalGerants, 
  onGerantClick, 
  searchTerm 
}) => {
  // État pour suivre quels gérants sont actifs
  const [activeAgents, setActiveAgents] = useState({});
  
  // Initialiser l'état des toggles basé sur estActif
  useEffect(() => {
    if (agents && agents.length > 0) {
      const initialActiveState = agents.reduce((acc, agent) => {
        // Utiliser estActif si disponible, sinon false par défaut
        acc[agent._id] = agent.estActif || false;
        return acc;
      }, {});
      setActiveAgents(initialActiveState);
    }
  }, [agents]);

  const handleToggleChange = (id, event) => {
    event.stopPropagation();
    setActiveAgents(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // Ici vous pourriez ajouter une fonction pour mettre à jour l'état dans la base de données
  };

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-4 gap-4">
        {agents && agents.length > 0 ? (
          agents.map((gerant) => (
            <div 
              key={gerant._id} 
              className="bg-white rounded-md shadow-sm border border-gray-100 p-3 flex flex-col items-center"
              onClick={() => onGerantClick && onGerantClick(gerant)}
            >
              <div className="flex flex-col items-center space-y-5 w-full">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-500">
                  <img 
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                    alt="Photo gérant" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xl text-gray-700 text-center">
                {gerant.nomEntreprise ? gerant.nomEntreprise.substring(0, 8) : (gerant.nom ? gerant.nom.substring(0, 8) : (gerant._id ? gerant._id.substring(0, 3) : ""))}
                </div>
              </div>
              {/* <div className="mt-2 w-full flex justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={activeAgents[gerant._id] || false} 
                    onChange={(e) => handleToggleChange(gerant._id, e)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer 
                    ${activeAgents[gerant._id] ? 'bg-green-500' : 'bg-gray-200'} 
                    peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                    after:transition-all
                    ${activeAgents[gerant._id] ? 'after:translate-x-5' : ''}`}></div>
                </label>
              </div> */}
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            {searchTerm ? "Aucun gérant ne correspond à votre recherche" : "Aucun gérant trouvé"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEntreprise;