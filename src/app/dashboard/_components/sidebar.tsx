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

const SidebarDashboard = ({ children, currentUser }: { children: React.ReactNode, currentUser?: User }) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="flex items-center justify-center w-full hover:bg-transparent"
              >
                <div className="flex items-center justify-center w-full">
                  <Image
                    src={logoDioko}
                    alt="Dioko Pro Logo"
                    width={140}
                    height={40}
                    priority
                    className="object-contain group-data-[collapsible=icon]:hidden"
                  />
                  {/* Icon version for collapsed state */}
                  <Image
                    src={logoDioko}
                    alt="Dioko Pro Logo"
                    width={32}
                    height={32}
                    priority
                    className="object-contain hidden group-data-[collapsible=icon]:block"
                  />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarMenuContent currentUser={currentUser} />
        <SidebarFooter className="border-t border-sidebar-border">
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
        <div id="main" className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarDashboard;
