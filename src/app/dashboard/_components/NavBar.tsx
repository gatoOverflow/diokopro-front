"use client"

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center bg-white border-b border-gray-200 px-4">
      {/* Left side - Sidebar trigger */}
      <div className="flex items-center">
        <SidebarTrigger className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side - Can add notifications, user avatar etc later */}
      <div className="flex items-center gap-2">
        {/* Placeholder for future items */}
      </div>
    </header>
  );
};

export default Navbar;
