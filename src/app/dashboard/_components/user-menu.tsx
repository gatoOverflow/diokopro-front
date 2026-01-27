"use client"

import React from 'react'
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

import { ChevronsUpDown, LogOut, User, Settings, Building2, Lock } from 'lucide-react';
import Link from 'next/link';

import { User as UserType } from '@/lib/type';
import { logout } from '@/actions/login';

const UserMenu = ({ currentUser }: { currentUser?: UserType }) => {
  const router = useRouter();

  const handleLogout = () => {
    logout()
    router.push("/auth/login");
  };

  // Get initials from name
  const getInitials = () => {
    const nom = currentUser?.nom || '';
    const prenom = currentUser?.prenom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (currentUser?.role) {
      case 'superAdmin':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'admin':
        return 'bg-[#0cadec]/10 text-[#0cadec] border-[#0cadec]/30';
      case 'gerant':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Format role name
  const formatRole = () => {
    switch (currentUser?.role) {
      case 'superAdmin':
        return 'Super Admin';
      case 'admin':
        return 'Administrateur';
      case 'gerant':
        return 'Gérant';
      default:
        return currentUser?.role || 'Utilisateur';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          {/* Avatar */}
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-[#0cadec] text-white text-sm font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* User info */}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {currentUser?.prenom} {currentUser?.nom}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {currentUser?.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarFallback className="rounded-lg bg-[#0cadec] text-white font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {currentUser?.prenom} {currentUser?.nom}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {currentUser?.email}
              </span>
              <Badge variant="outline" className={`mt-1 w-fit text-xs ${getRoleBadgeColor()}`}>
                {formatRole()}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/profile/${currentUser?._id}`} className="flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              <span>Mon profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/profile/${currentUser?._id}/updateProfile`} className="flex items-center gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              <span>Modifier le profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/profile/${currentUser?._id}/updateEntreprise`} className="flex items-center gap-2 cursor-pointer">
              <Building2 className="w-4 h-4" />
              <span>Mon entreprise</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/profile/${currentUser?._id}/changePassWord`} className="flex items-center gap-2 cursor-pointer">
              <Lock className="w-4 h-4" />
              <span>Changer le mot de passe</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
