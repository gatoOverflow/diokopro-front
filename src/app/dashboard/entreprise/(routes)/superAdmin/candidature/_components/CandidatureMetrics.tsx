"use client";

import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Building2
} from 'lucide-react';

interface CandidatureMetricsProps {
  totalPostulants: number;
  totalAcceptes: number;
  totalRefuses: number;
  tauxAcceptation: number;
}

const CandidatureMetrics: React.FC<CandidatureMetricsProps> = ({
  totalPostulants,
  totalAcceptes,
  totalRefuses,
  tauxAcceptation
}) => {
  const metrics = [
    {
      label: 'En attente',
      value: totalPostulants,
      icon: Clock,
      color: 'text-amber-600',
      bgIcon: 'bg-amber-100',
      bgCard: 'bg-gradient-to-br from-amber-50 to-orange-50',
      borderColor: 'border-amber-200'
    },
    {
      label: 'Acceptées',
      value: totalAcceptes,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-100',
      bgCard: 'bg-gradient-to-br from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'Refusées',
      value: totalRefuses,
      icon: XCircle,
      color: 'text-red-600',
      bgIcon: 'bg-red-100',
      bgCard: 'bg-gradient-to-br from-red-50 to-rose-50',
      borderColor: 'border-red-200'
    },
    {
      label: "Taux d'acceptation",
      value: `${tauxAcceptation}%`,
      icon: TrendingUp,
      color: 'text-[#0cadec]',
      bgIcon: 'bg-[#0cadec]/10',
      bgCard: 'bg-gradient-to-br from-cyan-50 to-sky-50',
      borderColor: 'border-[#0cadec]/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className={`${metric.bgCard} ${metric.borderColor} border rounded-2xl p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center gap-3">
              <div className={`${metric.bgIcon} p-3 rounded-xl`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-600">{metric.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidatureMetrics;
