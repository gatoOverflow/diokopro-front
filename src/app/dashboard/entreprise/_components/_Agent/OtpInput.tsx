"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onSubmit?: (otp: string) => void;
  onResend?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  buttonText?: string;
  title?: string;
  description?: string;
  timerDuration?: number; // en secondes
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  onSubmit,
  onResend,
  disabled = false,
  isLoading = false,
  loadingText = "Vérification en cours...",
  buttonText = "Valider",
  title = "Vérification OTP",
  description = "Un code de vérification à 6 chiffres a été envoyé à l'administrateur",
  timerDuration = 60 // 60 secondes par défaut
}) => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(timerDuration);
  const [canResend, setCanResend] = useState(false);
  
  // Initialiser les références pour les champs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    while (inputRefs.current.length < length) {
      inputRefs.current.push(null);
    }
    
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [length]);
  
  // Gestion du chronomètre
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);
  
  // Formatage du timer pour afficher MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Accepter uniquement un seul chiffre
    if (/^[0-9]?$/.test(value)) {
      // Mettre à jour le tableau des valeurs OTP
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      // Si un chiffre est entré et qu'il y a un champ suivant, focus sur le suivant
      if (value && index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Si l'utilisateur a rempli le dernier champ, appeler onComplete
      if (value && index === length - 1) {
        const completeOtp = [...newOtpValues].join('');
        onComplete(completeOtp);
      }
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si Backspace est pressé sur un champ vide, revenir au champ précédent
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      // Focus sur le champ précédent
      inputRefs.current[index - 1]?.focus();
      
      // Optionnel: effacer également la valeur du champ précédent
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = '';
      setOtpValues(newOtpValues);
    }
    
    // Si flèche droite et qu'il y a un champ suivant
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Si flèche gauche et qu'il y a un champ précédent
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'Enter' && otpValues.every(val => val !== '') && onSubmit) {
      e.preventDefault();
      onSubmit(otpValues.join(''));
    }
  };
  
  // Permettre le collage d'un code complet
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, length);
    
    if (pasteData) {
      const newOtpValues = [...otpValues];
      
      // Remplir les valeurs depuis les données collées
      for (let i = 0; i < pasteData.length; i++) {
        if (i < length) {
          newOtpValues[i] = pasteData[i];
        }
      }
      
      setOtpValues(newOtpValues);
      
      // Si tous les champs sont remplis après le collage, appeler onComplete
      if (pasteData.length === length) {
        onComplete(pasteData);
      }
      
      // Focus sur le dernier champ rempli ou le suivant
      const focusIndex = Math.min(pasteData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };
  
  // Vérifier si tous les champs sont remplis
  const isComplete = otpValues.every(val => val !== '');
  
  // Construire le code OTP complet
  const completeOtp = otpValues.join('');
  
  // Gérer la soumission du formulaire
  const handleSubmit = () => {
    if (isComplete && !disabled && !isLoading) {
      onComplete(completeOtp);
      onSubmit?.(completeOtp);
    }
  };

  // Gérer le renvoi du code
  const handleResend = () => {
    if (canResend && onResend) {
      onResend();
      setTimer(timerDuration); // Réinitialiser le timer
      setCanResend(false);     // Désactiver le renvoi
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto border border-blue-100 rounded-lg p-6 bg-white shadow-sm">
      {/* Icône et Titre */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-center text-sm text-gray-500 mt-2 mb-6">{description}</p>
      </div>
      
      {/* Champs OTP */}
      <div className="w-full">
        <div className="flex justify-between gap-2 mb-6">
          {Array.from({ length }).map((_, index) => (
            <Input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpValues[index]}
              onChange={(e) => handleOtpChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              disabled={disabled || isLoading}
              className="w-12 h-12 text-center text-xl font-bold rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={`Chiffre ${index + 1} du code OTP`}
            />
          ))}
        </div>
      </div>
      
      {/* Timer */}
      <div className="text-center font-medium text-gray-700 text-lg mb-4">
        {formatTime(timer)}
      </div>
      
      {/* Boutons d'action */}
      <div className="flex w-full gap-4">
        <Button 
          onClick={handleResend} 
          disabled={!canResend || disabled || isLoading}
          variant="outline"
          className="flex-1"
        >
          Renvoyer le Code
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!isComplete || disabled || isLoading}
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          {isLoading ? loadingText : buttonText}
        </Button>
      </div>
    </div>
  );
};

export default OtpInput;