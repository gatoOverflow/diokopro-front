'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserInfos } from "@/app/lib/types";
import { updatePassword } from "@/actions/Register";

type Props = {
  user: UserInfos;
};

export default function ChangePassword({ user }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Ajouter les champs au FormData

      formDataToSend.append("email", user.email); // Ajouter l'email
      formDataToSend.append("password", currentPassword);
      formDataToSend.append("newPassword", newPassword);

      const response = await updatePassword({}, formDataToSend);

      if (response?.type === "error") {
        toast.error("Erreur lors de la mise à jour !");
        throw new Error(response.message || "Erreur lors du changement de mot de passe.");
      }

      setSuccess("Mot de passe changé avec succès !");
      toast.success("Mise à jour réussie !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push(`/dashboard/profile/${user._id}`), 2000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:p-6 overflow-hidden">
      <h1 className="text-3xl font-bold text-indigo-900 mb-6 text-center">Changer de mot de passe</h1>
      <Card className="max-w-5xl w-full mx-auto p-4 md:p-8">
        <CardHeader></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              {/* Affichage de l'email (lecture seule) */}
              <div className="grid gap-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-sm text-gray-500">Votre adresse email ne peut pas être modifiée</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={error ? "border-red-500" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={error ? "border-red-500" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={error ? "border-red-500" : ""}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-500 text-center">{success}</p>}

            <div className="flex justify-center">
              <Button type="submit" className="w-full md:w-1/2">
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}