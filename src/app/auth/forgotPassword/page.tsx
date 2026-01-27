import React from 'react';
import ForgotPasswordFormV2 from './_components/ForgotPasswordFormV2';
import logoright from "../../../../public/img/49d8b26e015a7e225b4d9e7d54de9596ff91defa.jpg";
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ForgotPasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (token) {
    redirect("/dashboard/Agents");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row">
        <ForgotPasswordFormV2 />
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src={logoright}
            alt="Image d'authentification"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}
