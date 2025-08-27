import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import SubmitButton from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/logo.ico";

interface ResetPasswordFormViewProps {
  email: string;
  setEmail: (value: string) => void;
  state: any;
  handleResetPassword: (formData: FormData) => Promise<void>;
}

export const ResetPasswordFormView = ({
  email,
  setEmail,
  state,
  handleResetPassword,
}: ResetPasswordFormViewProps) => {
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
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form action={handleResetPassword} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {state?.errors?.email && (
            <CustomInputError>{state.errors.email}</CustomInputError>
          )}
        </div>

        <AlertFeedback type={state?.type} message={state?.message} />

        <SubmitButton title="Send Reset Link" />
      </form>

      <div className="my-6 flex items-center justify-center gap-2">
        <span className="text-sm text-neutral-600">Remember your password?</span>
        <Link href={"/auth/login"} className="text-blue-500">
          Back to Login
        </Link>
      </div>
    </>
  );
};
