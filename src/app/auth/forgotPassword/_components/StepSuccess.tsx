"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";

interface StepSuccessProps {
  onRedirect: () => void;
}

const StepSuccess: React.FC<StepSuccessProps> = ({ onRedirect }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onRedirect();
    }
  }, [countdown, onRedirect]);

  return (
    <>
      <div className="py-8 flex items-center justify-center">
        <div className="w-36">
          <Link href="/">
            <Image
              src={logoDioko}
              alt="Logo Dioko"
              className="object-contain"
            />
          </Link>
        </div>
      </div>

      <div className="text-center py-8">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <h2 className="text-2xl font-bold mb-3 text-gray-900">
          Mot de passe réinitialisé !
        </h2>
        <p className="text-gray-600 mb-6">
          Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Redirection automatique dans <span className="font-semibold text-[#0cadec]">{countdown}s</span>
        </p>

        <Button
          onClick={onRedirect}
          className="w-full h-11 bg-[#0cadec] hover:bg-[#0cadec]/90"
        >
          <span>Se connecter</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};

export default StepSuccess;
