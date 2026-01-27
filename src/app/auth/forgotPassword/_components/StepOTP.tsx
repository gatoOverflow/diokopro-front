"use client";

import React, { useState, useEffect } from "react";
import { AlertFeedback } from "@/components/alert-feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Mail, Phone } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";

interface StepOTPProps {
  otp: string;
  setOtp: (value: string) => void;
  identifier: string;
  identifierType: "email" | "telephone";
  state: {
    type: string;
    message: string;
  };
  onSubmit: () => void;
  onResendOTP: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const StepOTP: React.FC<StepOTPProps> = ({
  otp,
  setOtp,
  identifier,
  identifierType,
  state,
  onSubmit,
  onResendOTP,
  onBack,
  isLoading,
}) => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    if (canResend) {
      onResendOTP();
      setCountdown(60);
      setCanResend(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onSubmit();
    }
  };

  const maskIdentifier = () => {
    if (identifierType === "email") {
      const [name, domain] = identifier.split("@");
      const maskedName = name.substring(0, 2) + "***";
      return `${maskedName}@${domain}`;
    } else {
      return identifier.substring(0, 6) + "****" + identifier.slice(-2);
    }
  };

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

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Vérification du code</h2>
        <p className="text-gray-600">
          Entrez le code à 6 chiffres envoyé à
        </p>
        <div className="flex items-center gap-2 mt-2 text-[#0cadec] font-medium">
          {identifierType === "email" ? (
            <Mail className="w-4 h-4" />
          ) : (
            <Phone className="w-4 h-4" />
          )}
          <span>{maskIdentifier()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otp">Code OTP</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              render={({ slots }) => (
                <InputOTPGroup className="gap-2">
                  {slots.map((slot, index) => (
                    <InputOTPSlot
                      key={index}
                      {...slot}
                      index={index}
                      className="w-12 h-12 text-lg border-gray-300 rounded-lg"
                    />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
        </div>

        <AlertFeedback type={state?.type} message={state?.message} />

        <Button
          type="submit"
          className="w-full h-11 bg-[#0cadec] hover:bg-[#0cadec]/90"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Vérification..." : "Vérifier le code"}
        </Button>

        {/* Resend OTP */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-[#0cadec] hover:underline flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Renvoyer le code
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Renvoyer le code dans <span className="font-semibold text-[#0cadec]">{countdown}s</span>
            </p>
          )}
        </div>
      </form>

      <div className="my-6 flex items-center justify-center gap-2">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-[#0cadec] flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Modifier l'identifiant
        </button>
      </div>
    </>
  );
};

export default StepOTP;
