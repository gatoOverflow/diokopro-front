"use client"

import React from 'react'
import { useRouter } from "next/navigation";

// import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

import {ChevronsUpDown, CreditCard, LogOut, UserRoundCog, UserRoundPen } from 'lucide-react';
import Link from 'next/link';

import { User } from '@/lib/type';
import { logout } from '@/actions/login';

const UserMenu = ({ currentUser }: { currentUser?: User }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Delete the authentication token from cookies
    logout()
    // Redirect the user to the login page
    router.push("/auth/login");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
         
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {currentUser?.nom} {currentUser?.prenom}
            </span>
            <span className="truncate text-xs">
              {currentUser?.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {currentUser?.nom} {currentUser?.prenom}
              </span>
              <span className="truncate text-xs">
                {currentUser?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserRoundCog />
            <Link href={`/dashboard/profile/${currentUser?._id}`}>
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserRoundPen />
            <Link href={`/dashboard/profile/${currentUser?._id}/updateProfile`}>
              Update Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserRoundPen />
            <Link href={`/dashboard/profile/${currentUser?._id}/updateEntreprise`}>
              Update Entreprise
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            <Link href={`/dashboard/profile/${currentUser?._id}/changePassWord`}>
              Change password
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu