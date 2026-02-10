import { AlertFeedback } from "@/components/alert-feedback";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRef, useState, useEffect } from "react";
import { RefreshCw, Smartphone, ArrowLeft } from "lucide-react";

interface OtpFormViewProps {
  otp: string;
  setOtp: (value: string) => void;
  email: string;
  otpState: any;
  handleVerifyOtp: (formData: FormData) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  onBack: () => void;
  entrepriseId: string;
  isResending?: boolean;
}

export const OtpFormView = ({
  otp,
  setOtp,
  email,
  otpState,
  handleVerifyOtp,
  handleResendOtp,
  onBack,
  entrepriseId,
  isResending = false,
}: OtpFormViewProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown pour le renvoi d'OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', otp);
      formData.append('entrepriseId', entrepriseId);
      handleVerifyOtp(formData);
    }
  };

  const handleResend = async () => {
    if (canResend && !isResending) {
      await handleResendOtp();
      setCountdown(60);
      setCanResend(false);
      setOtp(""); // Réinitialiser le champ OTP
    }
  };

  // Masquer l'email pour la confidentialité
  const maskEmail = () => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    const maskedName = name.substring(0, 2) + "***";
    return `${maskedName}@${domain}`;
  };

  return (
    <>
      <div className="py-8 flex items-center justify-center">
        <div className="w-36">
          <Link href="/">
            <Image
              src={logoDioko}
              alt="Image d'authentification"
              className="object-contain"
            />
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Vérification OTP</h2>
        <p className="text-gray-600">
          Entrez le code à 6 chiffres envoyé par SMS
        </p>
        <div className="flex items-center gap-2 mt-2 text-[#0cadec] font-medium">
          <Smartphone className="w-4 h-4" />
          <span>{maskEmail()}</span>
        </div>
      </div>

      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
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
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="otp" value={otp} />
          <input type="hidden" name="entrepriseId" value={entrepriseId} />
        </div>

        <AlertFeedback type={otpState?.type} message={otpState?.message} />

        <Button
          type="submit"
          className="w-full h-11 bg-[#0cadec] hover:bg-[#0cadec]/90"
          disabled={otp.length !== 6}
        >
          Vérifier le code
        </Button>

        {/* Renvoyer OTP */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-[#0cadec] hover:underline flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? "Envoi en cours..." : "Renvoyer le code"}
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Renvoyer le code dans <span className="font-semibold text-[#0cadec]">{countdown}s</span>
            </p>
          )}
        </div>
      </form>

      {/* Retour à la connexion */}
      <div className="my-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-[#0cadec] flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </button>
      </div>
    </>
  );
};

export default OtpFormView;
