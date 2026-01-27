"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordOTP, resetPasswordWithOTP } from "@/actions/forgotPasswordV2";
import StepIdentifier from "./StepIdentifier";
import StepOTP from "./StepOTP";
import StepNewPassword from "./StepNewPassword";
import StepSuccess from "./StepSuccess";

type Step = "identifier" | "otp" | "password" | "success";

const ForgotPasswordFormV2 = () => {
  const router = useRouter();

  // Current step
  const [currentStep, setCurrentStep] = useState<Step>("identifier");

  // Form data
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<"email" | "telephone">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // State for each step
  const [identifierState, setIdentifierState] = useState({
    type: "",
    message: "",
    errors: {} as Record<string, string[]>,
  });

  const [otpState, setOtpState] = useState({
    type: "",
    message: "",
  });

  const [passwordState, setPasswordState] = useState({
    type: "",
    message: "",
    errors: {} as Record<string, string[]>,
  });

  // Step 1: Request OTP
  const handleRequestOTP = useCallback(async () => {
    setIsLoading(true);
    setIdentifierState({ type: "", message: "", errors: {} });

    try {
      const result = await requestPasswordOTP(identifier, identifierType);

      if (result.type === "success") {
        setIdentifierState({
          type: "success",
          message: result.message || "Code envoyé avec succès",
          errors: {},
        });
        // Move to OTP step
        setTimeout(() => setCurrentStep("otp"), 500);
      } else {
        setIdentifierState({
          type: "error",
          message: result.message || "",
          errors: result.errors || {},
        });
      }
    } catch (error) {
      setIdentifierState({
        type: "error",
        message: "Une erreur est survenue",
        errors: {},
      });
    } finally {
      setIsLoading(false);
    }
  }, [identifier, identifierType]);

  // Resend OTP
  const handleResendOTP = useCallback(async () => {
    setIsLoading(true);
    setOtpState({ type: "", message: "" });

    try {
      const result = await requestPasswordOTP(identifier, identifierType);

      if (result.type === "success") {
        setOtpState({
          type: "success",
          message: "Nouveau code envoyé avec succès",
        });
      } else {
        setOtpState({
          type: "error",
          message: result.message || "Erreur lors de l'envoi",
        });
      }
    } catch (error) {
      setOtpState({
        type: "error",
        message: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  }, [identifier, identifierType]);

  // Step 2: Verify OTP and move to password step
  const handleVerifyOTP = useCallback(() => {
    // The actual verification happens in step 3 with the password reset
    // Here we just move to the password step
    setOtpState({ type: "", message: "" });
    setCurrentStep("password");
  }, []);

  // Step 3: Reset password
  const handleResetPassword = useCallback(async () => {
    setIsLoading(true);
    setPasswordState({ type: "", message: "", errors: {} });

    try {
      const result = await resetPasswordWithOTP(
        identifier,
        identifierType,
        otp,
        newPassword,
        confirmPassword
      );

      if (result.type === "success") {
        setPasswordState({
          type: "success",
          message: result.message || "Mot de passe réinitialisé avec succès",
          errors: {},
        });
        // Move to success step
        setCurrentStep("success");
      } else {
        // Check if it's an OTP error - if so, go back to OTP step
        if (result.message?.toLowerCase().includes("otp")) {
          setOtpState({
            type: "error",
            message: result.message,
          });
          setOtp("");
          setCurrentStep("otp");
        } else {
          setPasswordState({
            type: "error",
            message: result.message || "",
            errors: result.errors || {},
          });
        }
      }
    } catch (error) {
      setPasswordState({
        type: "error",
        message: "Une erreur est survenue",
        errors: {},
      });
    } finally {
      setIsLoading(false);
    }
  }, [identifier, identifierType, otp, newPassword, confirmPassword]);

  // Go back to identifier step
  const handleBackToIdentifier = useCallback(() => {
    setOtp("");
    setOtpState({ type: "", message: "" });
    setCurrentStep("identifier");
  }, []);

  // Redirect to login
  const handleRedirectToLogin = useCallback(() => {
    router.push("/auth/login");
  }, [router]);

  // Progress indicator
  const getStepNumber = () => {
    switch (currentStep) {
      case "identifier": return 1;
      case "otp": return 2;
      case "password": return 3;
      case "success": return 4;
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8">
      {/* Progress Steps */}
      {currentStep !== "success" && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step < getStepNumber()
                    ? "bg-emerald-500 text-white"
                    : step === getStepNumber()
                      ? "bg-[#0cadec] text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < getStepNumber() ? "✓" : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-1 rounded ${
                    step < getStepNumber() ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      {currentStep === "identifier" && (
        <StepIdentifier
          identifier={identifier}
          setIdentifier={setIdentifier}
          identifierType={identifierType}
          setIdentifierType={setIdentifierType}
          state={identifierState}
          onSubmit={handleRequestOTP}
          isLoading={isLoading}
        />
      )}

      {currentStep === "otp" && (
        <StepOTP
          otp={otp}
          setOtp={setOtp}
          identifier={identifier}
          identifierType={identifierType}
          state={otpState}
          onSubmit={handleVerifyOTP}
          onResendOTP={handleResendOTP}
          onBack={handleBackToIdentifier}
          isLoading={isLoading}
        />
      )}

      {currentStep === "password" && (
        <StepNewPassword
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          state={passwordState}
          onSubmit={handleResetPassword}
          isLoading={isLoading}
        />
      )}

      {currentStep === "success" && (
        <StepSuccess onRedirect={handleRedirectToLogin} />
      )}
    </div>
  );
};

export default ForgotPasswordFormV2;
