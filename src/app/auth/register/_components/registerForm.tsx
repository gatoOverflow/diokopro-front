"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { register } from "@/actions/Register";
import Image from "next/image";
import { FormDataRegister } from "@/app/lib/types";
import Link from "next/link";
import { Calendar, User, Building2, Phone, Mail, Lock, FileText, Eye } from "lucide-react";
import SidePanel from "./SidePanel";

const RegistrationForm = () => {
    const router = useRouter();
    const [state, formAction] = React.useActionState(register, undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        telephone: "",
        nomEntreprise: "",
        ninea: "",
        dateCreation: "",
        rccm: "",
        representéPar: "",
        adresse: "",
        emailEntreprise: "",
        telephoneEntreprise: ""
    });

    useEffect(() => {
        if (state?.type === "success") {
            const timer = setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await formAction(formData);
            if (result?.type === "error") {
                console.error("Erreur d'inscription:", result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        setCurrentStep(2);
    };

    const prevStep = () => {
        setCurrentStep(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl shadow-lg overflow-hidden rounded-xl border-none">
                <div className="flex flex-col md:flex-row">
                    {/* Side Panel */}
                    <SidePanel currentStep={currentStep} />

                    {/* Form Content */}
                    <div className="w-full md:w-2/3 p-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Informations personnelles</h3>
                                        <p className="text-gray-500">Renseignez vos informations personnelles</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="prenom" className="font-medium text-gray-700">Prénom</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <User size={16} />
                                                </div>
                                                <Input
                                                    id="prenom"
                                                    name="prenom"
                                                    value={formData.prenom}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="Entrez votre prénom"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nom" className="font-medium text-gray-700">Nom</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <User size={16} />
                                                </div>
                                                <Input
                                                    id="nom"
                                                    name="nom"
                                                    value={formData.nom}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="Entrez votre nom"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-medium text-gray-700">Email</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <Mail size={16} />
                                            </div>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                placeholder="Entrez votre email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telephone" className="font-medium text-gray-700">Téléphone(veuillez Renseigner l'indicatif)</Label>
                                        
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <Phone size={16} />
                                                
                                            </div>
                                            <Input
                                                id="telephone"
                                                name="telephone"
                                                type="tel"
                                                value={formData.telephone}
                                                onChange={handleInputChange}
                                                className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                placeholder="+22177777777"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="font-medium text-gray-700">Mot de passe</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <Lock size={16} />
                                            </div>
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                placeholder="********"
                                                required
                                            />
                                            <div 
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <Eye size={16} className="opacity-70" /> : <Eye size={16} />}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum 8 caractères, incluant lettres et chiffres
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full bg-[#00B0F0]  text-white"
                                        >
                                            Continuer
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-14">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Informations entreprise</h3>
                                        <p className="text-gray-500">Renseignez les informations de votre entreprise</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nomEntreprise" className="font-medium text-gray-700">Nom de l'entreprise</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <Building2 size={16} />
                                            </div>
                                            <Input
                                                id="nomEntreprise"
                                                name="nomEntreprise"
                                                value={formData.nomEntreprise}
                                                onChange={handleInputChange}
                                                className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                placeholder="Entrez le nom de votre entreprise"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ninea" className="font-medium text-gray-700">NINEA</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <FileText size={16} />
                                                </div>
                                                <Input
                                                    id="ninea"
                                                    name="ninea"
                                                    value={formData.ninea}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="Entrez votre NINEA"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rccm" className="font-medium text-gray-700">RCCM</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <FileText size={16} />
                                                </div>
                                                <Input
                                                    id="rccm"
                                                    name="rccm"
                                                    value={formData.rccm}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="Entrez le numéro RCCM"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="adresse" className="font-medium text-gray-700">Adresse</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <FileText size={16} />
                                                </div>
                                                <Input
                                                    id="adresse"
                                                    name="adresse"
                                                    value={formData.adresse}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="Entrez votre Adresse"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emailEntreprise" className="font-medium text-gray-700">Email Entreprise</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <FileText size={16} />
                                                </div>
                                                <Input
                                                    id="emailEntreprise"
                                                    name="emailEntreprise"
                                                    value={formData.emailEntreprise}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="Entrez l'Email"
                                                    required
                                                />
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="telephoneEntreprise" className="font-medium text-gray-700">Telephone (veuillez Renseigner l'indicatif)</Label>
                    
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <FileText size={16} />
                                                </div>
                                                <Input
                                                    id="telephoneEntreprise"
                                                    name="telephoneEntreprise"
                                                    value={formData.telephoneEntreprise}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="+2217777777"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dateCreation" className="font-medium text-gray-700">Date de création</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <Calendar size={16} />
                                                </div>
                                                <Input
                                                    id="dateCreation"
                                                    name="dateCreation"
                                                    type="date"
                                                    value={formData.dateCreation}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="representéPar" className="font-medium text-gray-700">Représenté par</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                    <User size={16} />
                                                </div>
                                                <Input
                                                    id="representéPar"
                                                    name="representéPar"
                                                    value={formData.representéPar}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                                                    placeholder="Entrez le nom du représentant"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={prevStep}
                                            className="w-1/3 bg-[#A49F9F] text-white"
                                        >
                                            Retour
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="w-2/3 bg-[#00B0F0]  text-white"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Inscription en cours..." : "S'inscrire"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {state?.type === "error" && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>
                                    <p>{state.message}</p>
                                    {state.errors && (
                                        <ul className="list-disc pl-5 mt-2">
                                            {Object.entries(state.errors).map(([field, errors]) => (
                                                <li key={field}>
                                                    {field}: {Array.isArray(errors) ? errors.join(', ') : errors}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}

                        {state?.type === "success" && (
                            <Alert className="mt-4 bg-green-50 border-green-200">
                                <AlertTitle className="text-green-800">
                                    Inscription réussie !
                                </AlertTitle>
                                <AlertDescription className="text-green-600">
                                    Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion...
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RegistrationForm;