"use client";
import React, { useState, useCallback } from 'react';

import BalanceEntrepriseAllEntreprise from './Balance/BalanceEntreprise';

import AllEntreprise from './Components/AllEntreprise';
import MetricsCardsEntreprise from './Components/MetricsCards';

const CombinedViewTest = ({
    services,
    serviceId,
    balance,
    nombreTotalGerants,
    termeRecherche,
    clients,
    agentsResponse,
    clientsResponse,
    agentNotTopayer,
    getNumbersEntreprise,
    agentapayer,
    agents,
    gerants,
    clientNotTopayer,
    entrepriseId,
    nomEntreprise
}) => {

    const [selectedGerant, setSelectedGerant] = useState(null);



    const handleGerantClick = useCallback((gerant) => {
        setSelectedGerant(gerant);
        setIsGerantDialogOpen(true);
    }, []);



  





    




    return (
        <div className="p-2">


          
 <div className=' space-y-6 lg:w-[300px]'>
                    <div className="col-span-1 ">
                        <BalanceEntrepriseAllEntreprise totalSolde={balance}  />
                    </div>
                  <MetricsCardsEntreprise
                   agentsCount={agentsResponse} 
                   clientsCount={clientsResponse}
                   entrepriseCount={getNumbersEntreprise}
                   
                  />
                </div>
            {/* Section principale avec les listes */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Liste des Agents */}
                    <AllEntreprise 
                        agents={agents} 
                   totalGerants={nombreTotalGerants}
  onGerantClick={handleGerantClick}
  searchTerm={termeRecherche}
                    />

                    {/* Liste des Clients */}
                  
                </div>

                {/* Panneau latéral avec services */}
               
            </div>

          
        </div>
    );
};

export default CombinedViewTest;