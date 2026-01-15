"use client";

import React from 'react';
import {
  MessageSquare,
  Construction,
  Bell,
  Send,
  Sparkles,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const MessagesPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card principale */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header avec gradient */}
          <div className="relative bg-gradient-to-r from-[#0cadec] to-[#0a8bc7] p-8 text-white text-center">
            {/* Cercles décoratifs */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12" />

            {/* Icône animée */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute w-20 h-20 bg-white/20 rounded-full animate-ping" />
              <div className="relative w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2 relative">Messagerie</h1>
            <p className="text-white/80 text-sm relative">Centre de communication</p>
          </div>

          {/* Contenu */}
          <div className="p-8 text-center">
            {/* Badge en construction */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm font-medium mb-6">
              <Construction className="w-4 h-4" />
              <span>En cours de développement</span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Cette fonctionnalité arrive bientôt
            </h2>

            <p className="text-gray-500 mb-8 leading-relaxed">
              Notre équipe travaille activement sur le système de messagerie.
              Vous pourrez bientôt communiquer avec vos partenaires directement depuis la plateforme.
            </p>

            {/* Features à venir */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-[#0cadec]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Send className="w-5 h-5 text-[#0cadec]" />
                </div>
                <p className="text-sm font-medium text-gray-700">Messages directs</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-[#0cadec]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-[#0cadec]" />
                </div>
                <p className="text-sm font-medium text-gray-700">Notifications</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-[#0cadec]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-[#0cadec]" />
                </div>
                <p className="text-sm font-medium text-gray-700">Temps réel</p>
              </div>
            </div>

            {/* Estimation */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
              <Clock className="w-4 h-4" />
              <span>Lancement prévu prochainement</span>
            </div>

            {/* Bouton retour */}
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Dioko Pro © {new Date().getFullYear()} — Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;
