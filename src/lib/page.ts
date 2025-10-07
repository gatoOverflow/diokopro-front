import {
  LayoutGrid,
  CalendarCheck,
  Layers,
  Users,
  CreditCard
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getPages(pathname: string, role?: string): Group[] {
  // Page commune à tous les rôles
  const commonPage: Menu = {
    href: "/dashboard/Clients",
    label: "Clients",
    active: pathname === "/dashboard/Clients",
    icon: Users,
    submenus: []
  };
 
  // Page paiements
  const paiementsPage: Menu = {
    href: "/dashboard/paiements",
    label: "Paiements",
    active: pathname === "/dashboard/paiements",
    icon: CreditCard,
    submenus: []
  };
const AcceptPage: Menu = {
    href: "/dashboard/entreprise/candidature",
    label: "Candidature",
    active: pathname === "/dashboard/entreprise/candidature",
    icon: CreditCard,
    submenus: []
  };
  let rolePages: Group[] = [];

  // Rendre le tableau en fonction du rôle
  if (role === "admin") {
    rolePages = [
      {
        groupLabel: "Administrateur",
        menus: [
          {
            href: "/dashboard/entreprise",
            label: "Bureau",
            active: pathname === "/dashboard/entreprise",
            icon: LayoutGrid,
            submenus: []
          },
          {
            href: "/dashboard/Agents",
            label: "Agent",
            active: pathname === "/dashboard/Agents",
            icon: CalendarCheck,
            submenus: []
          },
          
          {
            href: "/dashboard/Gerants",
            label: "Gerant",
            active: pathname === "/dashboard/Gerants",
            icon: CalendarCheck,
            submenus: []
          },
           
          commonPage, // Ajout de la page commune
          //paiementsPage // Ajout de la page paiements
           {
            href: "/dashboard/entreprise/paiements",
            label: "Paiements",
            active: pathname === "/dashboard/entreprise/paiements",
            icon: CreditCard,
            submenus: []
          },
        ]
      },
    ];
  } else if (role === "gerant") {
    rolePages = [
      {
        groupLabel: "Gerant",
        menus: [
          {
            href: "/dashboard/entreprise",
            label: "Bureau",
            active: pathname === "/dashboard/entreprise",
            icon: LayoutGrid,
            submenus: []
          },
          {
            href: "/dashboard/Agents",
            label: "Agent",
            active: pathname === "/dashboard/Agents",
            icon: CalendarCheck,
            submenus: []
          },
          commonPage, // Ajout de la page commune
          paiementsPage // Ajout de la page paiements
        ]
      },
    ];
  } else if (role === "superAdmin") {
    rolePages = [
      {
        groupLabel: "SuperAdmin",
        menus: [
          {
            href: "/dashboard/entreprise/superAdmin/partenaire",
            label: "Partenaires",
            active: pathname === "/dashboard/entreprise/superAdmin/partenaire",
            icon: Layers,
            submenus: []
          },
          {
            href: "/dashboard/entreprise/superAdmin/candidature",
            label: "Candidature",
            active: pathname === "/dashboard/entreprise/superAdmin/candidature",
            icon: LayoutGrid,
            submenus: []
          }, // Ajout de la page commune
          {
            href: "/dashboard/entreprise/superAdmin/candidature",
            label: "Messages",
            active: pathname === "/dashboard/entreprise/superAdmin/candidature",
            icon: LayoutGrid,
            submenus: []
          }, // Ajout de la page commune
          paiementsPage ,
         
        
        ]
      },
    ];
  } else {
    // Pour les utilisateurs sans rôle spécifique ou non authentifiés
    rolePages = [
      {
        groupLabel: "Navigation",
        menus: [commonPage] // Au minimum, accès à la page commune
      }
    ];
  }

  return rolePages;
}