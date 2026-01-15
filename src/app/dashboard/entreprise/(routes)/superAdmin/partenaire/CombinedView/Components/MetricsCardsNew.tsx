"use client";

import React from 'react';
import { Building2, Users, UserCheck, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface MetricsCardsProps {
  entrepriseCount?: number;
  agentsCount?: number;
  clientsCount?: number;
  activeCount?: number;
}

const MetricsCardsNew: React.FC<MetricsCardsProps> = ({
  entrepriseCount = 0,
  agentsCount = 0,
  clientsCount = 0,
  activeCount = 0,
}) => {
  const metrics: MetricItem[] = [
    {
      label: 'Entreprises',
      value: entrepriseCount,
      icon: Building2,
      color: 'text-[#0cadec]',
      bgColor: 'bg-[#0cadec]/10',
      trend: { value: 12, isPositive: true },
    },
    {
      label: 'Agents',
      value: agentsCount,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: { value: 8, isPositive: true },
    },
    {
      label: 'Clients',
      value: clientsCount,
      icon: UserCheck,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      trend: { value: 5, isPositive: true },
    },
    {
      label: 'Actifs',
      value: activeCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: { value: 2, isPositive: false },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              {metric.trend && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    metric.trend.isPositive
                      ? 'text-green-700 bg-green-50'
                      : 'text-red-700 bg-red-50'
                  }`}
                >
                  {metric.trend.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{metric.trend.isPositive ? '+' : ''}{metric.trend.value}%</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {metric.value.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-gray-500 font-medium">{metric.label}</p>
            </div>

            {/* Progress bar decoration */}
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metric.color.replace('text-', 'bg-').replace('-600', '-500')
                }`}
                style={{ width: `${Math.min((metric.value / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCardsNew;
