"use client";

import React, { useState } from "react";
import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from "lucide-react";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";

interface StepNewPasswordProps {
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  state: {
    type: string;
    message: string;
    errors: Record<string, string[]>;
  };
  onSubmit: () => void;
  isLoading: boolean;
}

const StepNewPassword: React.FC<StepNewPasswordProps> = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  state,
  onSubmit,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Password strength indicators
  const passwordChecks = [
    { label: "Au moins 8 caractères", valid: newPassword.length >= 8 },
    { label: "Contient une majuscule", valid: /[A-Z]/.test(newPassword) },
    { label: "Contient une minuscule", valid: /[a-z]/.test(newPassword) },
    { label: "Contient un chiffre", valid: /[0-9]/.test(newPassword) },
  ];

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isFormValid = newPassword.length >= 8 && passwordsMatch;

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
        <h2 className="text-2xl font-bold mb-2">Nouveau mot de passe</h2>
        <p className="text-gray-600">
          Créez un nouveau mot de passe sécurisé pour votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Entrez votre nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {state?.errors?.newPassword && (
            <CustomInputError>{state.errors.newPassword[0]}</CustomInputError>
          )}
        </div>

        {/* Password Strength Indicators */}
        {newPassword && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Force du mot de passe</p>
            <div className="grid grid-cols-2 gap-2">
              {passwordChecks.map((check, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs ${
                    check.valid ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {check.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {check.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-11 pl-10 pr-10 ${
                confirmPassword && !passwordsMatch
                  ? "border-red-300 focus:border-red-500"
                  : confirmPassword && passwordsMatch
                    ? "border-emerald-300 focus:border-emerald-500"
                    : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <CustomInputError>Les mots de passe ne correspondent pas</CustomInputError>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Les mots de passe correspondent
            </p>
          )}
          {state?.errors?.confirmNewPassword && (
            <CustomInputError>{state.errors.confirmNewPassword[0]}</CustomInputError>
          )}
        </div>

        <AlertFeedback type={state?.type} message={state?.message} />

        <Button
          type="submit"
          className="w-full h-11 bg-[#0cadec] hover:bg-[#0cadec]/90"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </Button>
      </form>
    </>
  );
};

export default StepNewPassword;
