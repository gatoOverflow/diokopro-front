import React from 'react';
import { Card } from '@/components/ui/card';
import CreateAgentModal from '@/app/dashboard/AgentPage/_components/AddAgents';
import CreateClientModal from '@/app/dashboard/clientsPage/_components/Addclients';
import CreateServiceModal from '@/app/dashboard/_Service/_components/service';
import CreateGerantModal from '@/app/dashboard/AgentEntre/_components/AgentEntreprise';


const MetricsCardsEntreprise = ({
  agentsCount,
  clientsCount,
  servicesCount,
  entrepriseCount,
  entrepriseId,
  nomEntreprise,
  services
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 md:w-[900px] w-[500px] gap-5 mb-6">
     {/*  <div className="bg-white p-9 rounded-md shadow-xl">
        <h3 className="text-lg font-semibold">Total Entreprise</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-3xl font-bold text-[#0cadec]">{entrepriseCount}</p>

        </div>
      </div> */}
      <div className="bg-white p-9 rounded-md shadow-xl">
        <h3 className="text-lg font-semibold">Total Agents</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-3xl font-bold text-[#0cadec]">{agentsCount}</p>

        </div>
      </div>

      <div className="bg-white p-9 rounded-md shadow-xl">
        <h3 className="text-lg font-semibold">Total Clients</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-3xl font-bold text-[#0cadec]">{clientsCount}</p>

        </div>
      </div>




    </div>
  );
};

export default MetricsCardsEntreprise;