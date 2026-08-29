"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Building2 } from "lucide-react";

// Composant pour le panneau latéral uniquement
const SidePanel = () => {
    return (
        <div className="w-full md:w-1/3 bg-gradient-to-br from-blue-50 to-blue-50 p-6 flex flex-col justify-between">
            <div>
                <div className="mb-8 flex justify-center">
                    <Image
                        src="/img/NewDiokoDeseign.png"
                        alt="Logo Dioko"
                        width={150}
                        height={75}
                        className="mb-8"
                    />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-black">Créez votre compte professionnel</h2>
                <p className="text-gray-600 mb-16">Rejoignez notre plateforme et commencez à développer votre activité dès aujourd'hui.</p>
            </div>
            
            <div className="space-y-5">
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-orange-400`}>
                        <User size={20} className="text-white" />
                    </div>
                    <span className="text-gray-800 font-medium">Informations Personnelles</span>
                </div>
            </div>

            <div className="mt-20">
                <p className="text-sm text-black">
                    Vous avez déjà un compte ?{" "}
                    <Link href="/auth/login" className="text-[#00B0F0] font-semibold hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SidePanel;