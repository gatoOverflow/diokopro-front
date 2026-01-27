"use client";

import React from "react";
import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";

interface StepIdentifierProps {
  identifier: string;
  setIdentifier: (value: string) => void;
  identifierType: "email" | "telephone";
  setIdentifierType: (value: "email" | "telephone") => void;
  state: {
    type: string;
    message: string;
    errors: Record<string, string[]>;
  };
  onSubmit: () => void;
  isLoading: boolean;
}

const StepIdentifier: React.FC<StepIdentifierProps> = ({
  identifier,
  setIdentifier,
  identifierType,
  setIdentifierType,
  state,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
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
        <h2 className="text-2xl font-bold mb-2">Mot de passe oublié</h2>
        <p className="text-gray-600">
          Entrez votre email ou numéro de téléphone pour recevoir un code de vérification
        </p>
      </div>

      {/* Toggle Email/Phone */}
      <div className="flex gap-2 mb-6">
        <Button
          type="button"
          variant={identifierType === "email" ? "default" : "outline"}
          className={`flex-1 ${identifierType === "email" ? "bg-[#0cadec] hover:bg-[#0cadec]/90" : ""}`}
          onClick={() => {
            setIdentifierType("email");
            setIdentifier("");
          }}
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        <Button
          type="button"
          variant={identifierType === "telephone" ? "default" : "outline"}
          className={`flex-1 ${identifierType === "telephone" ? "bg-[#0cadec] hover:bg-[#0cadec]/90" : ""}`}
          onClick={() => {
            setIdentifierType("telephone");
            setIdentifier("");
          }}
        >
          <Phone className="w-4 h-4 mr-2" />
          Téléphone
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="identifier">
            {identifierType === "email" ? "Adresse email" : "Numéro de téléphone"}
          </Label>
          <Input
            id="identifier"
            name="identifier"
            type={identifierType === "email" ? "email" : "tel"}
            placeholder={identifierType === "email" ? "votre@email.com" : "+221 77 123 45 67"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-11"
          />
          {state?.errors?.identifier && (
            <CustomInputError>{state.errors.identifier[0]}</CustomInputError>
          )}
        </div>

        <AlertFeedback type={state?.type} message={state?.message} />

        <Button
          type="submit"
          className="w-full h-11 bg-[#0cadec] hover:bg-[#0cadec]/90"
          disabled={isLoading || !identifier}
        >
          {isLoading ? "Envoi en cours..." : "Envoyer le code"}
        </Button>
      </form>

      <div className="my-6 flex items-center justify-center gap-2">
        <ArrowLeft className="w-4 h-4 text-gray-500" />
        <Link href="/auth/login" className="text-[#0cadec] hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </>
  );
};

export default StepIdentifier;
