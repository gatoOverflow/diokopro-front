"use client";

import React from 'react';
import {
  Users,
  UserCheck,
  Briefcase,
  UserCog,
  Wallet,
  Clock,
  Plus
} from 'lucide-react';
import CreateAgentModal from '@/app/dashboard/AgentPage/_components/AddAgents';
import CreateClientModal from '@/app/dashboard/clientsPage/_components/Addclients';
import CreateServiceModal from '@/app/dashboard/_Service/_components/service';
import CreateGerantModal from '@/app/dashboard/AgentEntre/_components/AgentEntreprise';

interface MetricsCardsProps {
  agentsCount: number;
  gerantsCount: number;
  clientsCount: number;
  servicesCount: number;
  totalMasseSalariale?: number;
  totalPaiementsAttendus?: number;
  entrepriseId: string;
  nomEntreprise: string;
  services: any[];
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  agentsCount,
  gerantsCount,
  clientsCount,
  servicesCount,
  totalMasseSalariale = 0,
  totalPaiementsAttendus = 0,
  entrepriseId,
  nomEntreprise,
  services
}) => {
  // Cartes statistiques PROPRES (sans boutons d'action)
  const statsMetrics = [
    {
      label: 'Agents',
      value: agentsCount,
      icon: Users,
      color: 'text-blue-600',
      bgIcon: 'bg-blue-500',
      bgCard: 'bg-white',
    },
    {
      label: 'Clients',
      value: clientsCount,
      icon: UserCheck,
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-500',
      bgCard: 'bg-white',
    },
    {
      label: 'Services',
      value: servicesCount,
      icon: Briefcase,
      color: 'text-purple-600',
      bgIcon: 'bg-purple-500',
      bgCard: 'bg-white',
    },
    {
      label: 'Gérants',
      value: gerantsCount,
      icon: UserCog,
      color: 'text-amber-600',
      bgIcon: 'bg-amber-500',
      bgCard: 'bg-white',
    },
    {
      label: 'Masse Salariale',
      value: totalMasseSalariale?.toLocaleString() || '0',
      suffix: 'FCFA',
      icon: Wallet,
      color: 'text-cyan-600',
      bgIcon: 'bg-cyan-500',
      bgCard: 'bg-white',
    },
    {
      label: 'Paiements Attendus',
      value: totalPaiementsAttendus?.toLocaleString() || '0',
      suffix: 'FCFA',
      icon: Clock,
      color: 'text-rose-600',
      bgIcon: 'bg-rose-500',
      bgCard: 'bg-white',
    }
  ];

  return (
    <div className="space-y-4">
      {/* SECTION 1: Cartes statistiques PROPRES - 3 par ligne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`${metric.bgCard} rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${metric.bgIcon} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                      {metric.suffix && (
                        <span className="text-sm font-normal text-gray-400 ml-1">
                          {metric.suffix}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: Actions rapides (séparée, claire) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Agent */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
            <CreateAgentModal services={services} entrepriseId={entrepriseId} />
            <span className="text-sm font-medium text-blue-700">Nouvel Agent</span>
          </div>

          {/* Client */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
            <CreateClientModal services={services} entrepriseId={entrepriseId} />
            <span className="text-sm font-medium text-emerald-700">Nouveau Client</span>
          </div>

          {/* Service */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
            <CreateServiceModal enterprises={[{ _id: entrepriseId, nomEntreprise }]} />
            <span className="text-sm font-medium text-purple-700">Nouveau Service</span>
          </div>

          {/* Gérant */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
            <CreateGerantModal enterprises={[{ _id: entrepriseId, nomEntreprise }]} />
            <span className="text-sm font-medium text-amber-700">Nouveau Gérant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;
