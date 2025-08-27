"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ResetPasswordFormView } from "./reset-password-form-view";
import { ResetPassword } from "@/actions/login";

const ResetPasswordForm = () => {
  const router = useRouter();
  const [state, setState] = useState({
    message: "",
    type: "",
    errors: {},
  });
  const [email, setEmail] = useState("");

  const handleResetPassword = async (formData: FormData) => {
    const result = await ResetPassword(null, formData);
    setState({
      message: result.data?.message || "",
      type: result.type || "",
      errors: result.errors || {}
    });

    // Si la demande est réussie, on peut rediriger après un délai
    if (result.type === "success") {
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8">
      <ResetPasswordFormView
        email={email}
        setEmail={setEmail}
        state={state}
        handleResetPassword={handleResetPassword}
      />
    </div>
  );
};

export default ResetPasswordForm;