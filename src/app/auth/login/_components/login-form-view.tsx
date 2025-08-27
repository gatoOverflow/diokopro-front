import { AlertFeedback } from "@/components/alert-feedback";
import CustomInputError from "@/components/custom-input-error";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";

interface LoginFormViewProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  state: any;
  handleLogin: (formData: FormData) => Promise<void>;
}

export const LoginFormView = ({
  email,
  setEmail,
  password,
  setPassword,
  state,
  handleLogin,
}: LoginFormViewProps) => {
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
        <h2 className="text-2xl font-bold mb-2">Welcome to Dioko</h2>
        <p className="text-gray-600">Connecter vous</p>
      </div>
      <form action={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {state?.errors?.email && (
            <CustomInputError>{state.errors.email}</CustomInputError>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {state?.errors?.password && (
            <CustomInputError>{state.errors.password}</CustomInputError>
          )}
        </div>
        <AlertFeedback type={state?.type} message={state?.message} />
        <div className="text-blue-800 text-right text-sm cursor-pointer">
          <Link href={"/auth/forgotPassword"}>Forgot Password</Link>
        </div>
        <SubmitButton title="Submit" />
      </form>
    
    
      <div className="my-10 flex items-center justify-center gap-2">
        <span className="text-sm text-neutral-600">No account?</span>
        <Link href={"/auth/register"} className="text-blue-500">
          Create account
        </Link>
      </div>
    </>
  );
}; 