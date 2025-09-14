// components/SidebarDashboard.tsx (Client Component)
"use client"

import * as React from "react";

import logoDioko from "../../../../public/img/NewDiokoDeseign.png";

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import SidebarMenuContent from "./sidebar-menu";


import { User } from "@/lib/type";
import UserMenu from "./user-menu";
import Navbar from "./NavBar";
import Image from "next/image";
import { ChevronsUpDown } from "lucide-react";

const SidebarDashboard = ({ children, currentUser }: { children: React.ReactNode, currentUser?: User }) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
      <SidebarHeader className="">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  className="flex items-center justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
                >
                  <div className="w-full max-w-[120px]">
                    <Image
                      src={logoDioko}
                      alt="Dioko Pro Logo"
                      width={200}
                      height={50}
                      priority
                      className="object-contain"
                    />
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
        <SidebarMenuContent currentUser={currentUser} />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenu currentUser={currentUser} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Navbar />
        <div id="main" className=" px-10 py-6 bg-gray-100 h-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarDashboard;