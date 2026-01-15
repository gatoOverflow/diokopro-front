"use client"

import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { getPages } from '@/lib/page';
import { User } from '@/lib/type';
import { CollapseMenuButton } from './collapse-menu-button';
import { PasswordModal } from './PasswordModal';

// Create a context to manage authentication state
const AuthContext = React.createContext({
  isAuthenticated: false,
  checkAuthentication: () => false
});

const SidebarMenuContent = ({ currentUser }: { currentUser?: User}) => {
    const { open } = useSidebar()
    const pathname = usePathname();
    const router = useRouter();
    const pages = getPages(pathname, currentUser?.role);
    
    // Password modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    // URL to navigate to after password validation
    const [pendingUrl, setPendingUrl] = useState("");
    // Inactivity timer reference
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Last activity timestamp
    const lastActivityRef = useRef<number>(Date.now());
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Protected paths requiring authentication (EXCLUDING the clients page)
    const protectedPaths = [
      '/dashboard/entreprise', 
      '/bureau',
      // Filtre les menus pour inclure uniquement les chemins protégés
      ...pages.flatMap(group => 
        group.menus.filter(menu => menu.label === 'Bureau' && !menu.href.includes('/dashboard/entreprise'))
              .flatMap(menu => [menu.href, ...menu.submenus.map(sub => sub.href)])
      )
    ];
    
    // Liste explicite des chemins exclus de la protection par mot de passe
    const excludedPaths = [
      '/dashboard/entreprise/acceptEntreprise'
    ];
    
    // Function to check if the session is valid (less than 1 minute)
    const isSessionValid = () => {
      const lastValidation = sessionStorage.getItem("bureauPasswordTimestamp");
      if (!lastValidation) return false;
      
      const validationTime = parseInt(lastValidation);
      const currentTime = new Date().getTime();
      
      // Check if less than 1 minute (60000 ms) has elapsed
      return currentTime - validationTime < 300000;
    };

    // Check authentication and update state
    const checkAuthentication = () => {
      const isValid = isSessionValid();
      setIsAuthenticated(isValid);
      return isValid;
    };

    // Function to check if a path is protected
    const isProtectedPath = (path: string) => {
      // Vérifie d'abord si le chemin est dans la liste des exclusions
      if (excludedPaths.some(excludedPath => path === excludedPath)) {
        return false;
      }
      // Ensuite vérifie s'il est dans la liste des chemins protégés
      return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
    };

    // Function to record user activity
    const recordUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Function to start monitoring inactivity
    const startInactivityMonitoring = () => {
      // Clear any existing timer
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      
      // Set up a periodic check (every 5 seconds) rather than resetting timer on each event
      inactivityTimerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const inactiveTime = currentTime - lastActivityRef.current;
        
        // If user has been inactive for more than 1 minute
        if (inactiveTime >= 300000) {
          // Remove validation timestamp
          sessionStorage.removeItem("bureauPasswordTimestamp");
          
          // Update authentication state
          checkAuthentication();
          
          // Show password modal if user is on a protected page and not on the clients page
          if (isProtectedPath(pathname)) {
            setPendingUrl(pathname);
            setShowPasswordModal(true);
            // Force redirect if on protected page
            router.push('/dashboard/Agents');
          }
          
          // Reset the timer after triggering logout
          lastActivityRef.current = currentTime;
        }
      }, 5000); // Check every 5 seconds
    };

    // Effect to handle user activity events and inactivity timer
    useEffect(() => {
      // Function to handle user activity
      const handleUserActivity = () => {
        recordUserActivity();
      };
      
      // Only add listeners for significant activity (not mousemove which happens constantly)
      document.addEventListener('mousedown', handleUserActivity);
      document.addEventListener('keypress', handleUserActivity);
      document.addEventListener('scroll', handleUserActivity, { passive: true });
      
      // Check authentication on component mount
      const initialCheck = checkAuthentication();
      
      // If on protected path and not authenticated, redirect
      if (isProtectedPath(pathname) && !initialCheck) {
        setPendingUrl(pathname);
        setShowPasswordModal(true);
        router.push('/dashboard/Agents');
      } else {
        // Initialize inactivity monitoring
        startInactivityMonitoring();
      }
      
      // Clean up listeners and timer when component unmounts
      return () => {
        document.removeEventListener('mousedown', handleUserActivity);
        document.removeEventListener('keypress', handleUserActivity);
        document.removeEventListener('scroll', handleUserActivity);
        
        if (inactivityTimerRef.current) {
          clearInterval(inactivityTimerRef.current);
        }
      };
    }, [pathname]);

    // Handler for link clicks
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Record activity
      recordUserActivity();
      
      // Check if link leads to a protected path
      if (isProtectedPath(href)) {
        e.preventDefault();
        
        // Check if session is valid
        if (checkAuthentication()) {
          // If session is valid, navigate directly
          router.push(href);
        } else {
          // Otherwise, ask for password
          setPendingUrl(href);
          setShowPasswordModal(true);
        }
      }
      // Otherwise, allow default behavior (navigation sans mot de passe)
    };

    // Function called when password is correct
    const handlePasswordSuccess = () => {
      // Record validation timestamp
      sessionStorage.setItem("bureauPasswordTimestamp", new Date().getTime().toString());
      
      setShowPasswordModal(false);
      checkAuthentication();
      router.push(pendingUrl);
      
      // Record activity
      recordUserActivity();
    };

    // Function called when user cancels
    const handlePasswordCancel = () => {
      setShowPasswordModal(false);
      
      // If user was on a protected page and canceled, redirect
      if (isProtectedPath(pathname)) {
        router.push('/dashboard/serviceEntre');
      }
    };

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuthentication }}>
      <SidebarContent>
          <ul className="flex flex-col items-start space-y-1 px-2">
          {pages.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {(open && groupLabel) || open === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !open && open !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(({ href, label, icon: Icon, active, submenus }, index) =>
                submenus.length === 0 ? (
                  
                  <div className="w-full" key={index}>
                    <TooltipProvider disableHoverableContent>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={active ? "default" : "ghost"}
                            className={cn("w-full justify-start h-10 mb-1", active && "text-[18px]")}
                            asChild
                          >
                            <Link href={href} onClick={(e) => handleLinkClick(e, href)}>
                              <span
                                className={cn( "mr-4")}
                              >
                                <Icon size={18} />
                              </span>
                              <p
                                className={cn(
                                  "max-w-[200px] truncate",
                                  open === false
                                    ? "-translate-x-96 opacity-0"
                                    : "translate-x-0 opacity-100"
                                )}
                              >
                                {label}
                              </p>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        {open === false && (
                          <TooltipContent side="right">{label}</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="w-full" key={index}>
                    <CollapseMenuButton
                      icon={Icon}
                      label={label}
                      active={active}
                      submenus={submenus}
                      isOpen={open}
                      onSubmenuClick={handleLinkClick}
                    />
                  </div>
                )
              )}
            </li>
          ))}
        </ul>

        {/* Password modal */}
        {showPasswordModal && (
          <PasswordModal
            onSuccess={handlePasswordSuccess}
            onCancel={handlePasswordCancel}
            userRole={currentUser?.role} // ✅ Utilise le vrai rôle de l'utilisateur
            enterpriseId={currentUser?.enterpriseId} // ✅ Passe aussi l'ID de l'entreprise si disponible
          />
        )}
      </SidebarContent>
    </AuthContext.Provider>
  )
}

// Hook to use authentication context in other components
export const useAuth = () => React.useContext(AuthContext);

export default SidebarMenuContent