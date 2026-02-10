"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/login";
import { verifyOtp } from "@/actions/verifyOtp";
import { LoginFormView } from "./login-form-view";
import { OtpFormView } from "./otp-form-view";
import { toast } from "sonner";

const LoginForm = () => {
  const router = useRouter();
  const [state, setState] = useState({
    requiresOtp: false,
    email: "",
    message: "",
    type: "",
    errors: {},
  });

  const [otpState, setOtpState] = useState({
    type: "",
    message: "",
    url: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleLogin = async (formData: FormData) => {
    // Sauvegarder email et password pour le renvoi d'OTP
    const emailValue = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;
    setEmail(emailValue);
    setPassword(passwordValue);

    const result = await login(null, formData);
    setState({
      requiresOtp: result.requiresOtp || false,
      email: result.email || emailValue,
      message: result.message || "",
      type: result.type || "",
      errors: result.errors || {}
    });
  };

  const handleVerifyOtp = async (formData: FormData) => {
    const result = await verifyOtp(null, formData);
    const entrepriseId = formData.get('entrepriseId');

    setOtpState({
      type: result.type || "",
      message: result.message || "",
      url: result.url || ""
    });

    if (result.type === "redirect" && result.url) {
      router.push(result.url);
    }
  };

  const handleResendOtp = async () => {
    if (!email || !password) {
      toast.error("Informations de connexion manquantes");
      return;
    }

    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await login(null, formData);

      if (result.requiresOtp) {
        toast.success("Nouveau code OTP envoyé par SMS");
        setOtpState({
          type: "success",
          message: "Nouveau code OTP envoyé par SMS",
          url: ""
        });
      } else if (result.type === "error") {
        toast.error(result.message || "Erreur lors du renvoi du code");
        setOtpState({
          type: "error",
          message: result.message || "Erreur lors du renvoi du code",
          url: ""
        });
      }
    } catch (error) {
      toast.error("Erreur lors du renvoi du code OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    // Réinitialiser l'état pour revenir au formulaire de connexion
    setState({
      requiresOtp: false,
      email: "",
      message: "",
      type: "",
      errors: {},
    });
    setOtpState({
      type: "",
      message: "",
      url: "",
    });
    setOtp("");
  };

  useEffect(() => {
    if (otpState.type === "redirect") {
      router.push(otpState.url);
    }
  }, [otpState, router]);

  return (
    <div className="w-full md:w-1/2 p-8">
      {!state.requiresOtp ? (
        <LoginFormView
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          state={state}
          handleLogin={handleLogin}
        />
      ) : (
        <OtpFormView
          otp={otp}
          setOtp={setOtp}
          email={email || state.email}
          otpState={otpState}
          handleVerifyOtp={handleVerifyOtp}
          handleResendOtp={handleResendOtp}
          onBack={handleBack}
          isResending={isResending}
          entrepriseId=""
        />
      )}
    </div>
  );
};

export default LoginForm;
