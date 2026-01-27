"use client";

import React from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BalanceCardProps {
  totalSolde: number;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  totalSolde = 0,
  trend,
  subtitle = 'Solde total des partenaires',
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0cadec] to-[#0a8bc7] rounded-2xl p-6 text-white mb-6 shadow-xl shadow-[#0cadec]/20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section - Balance Info */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">{subtitle}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-bold tracking-tight">
                {formatAmount(totalSolde)}
              </span>
              <span className="text-xl font-medium text-white/90">FCFA</span>
            </div>
          </div>
        </div>

        {/* Right Section - Trend */}
        {trend && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
            trend.isPositive ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}>
            {trend.isPositive ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-sm text-white/80">{trend.label}</span>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="relative mt-6 pt-6 border-t border-white/20 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-white/70">Partenaires actifs</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-white/70">En attente</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">98%</p>
          <p className="text-xs text-white/70">Taux d'activité</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">+5</p>
          <p className="text-xs text-white/70">Ce mois</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
