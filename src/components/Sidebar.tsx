"use client";

import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Home,
  Zap,
  ListChecks,
  BarChart3,
  Settings as SettingsIcon,
  User,
  Info, // Importar o ícone Info
  LogOut,
} from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
  onClick?: () => void;
}

const NavLink = ({ to, icon: Icon, label, currentPath, onClick }: NavLinkProps) => {
  const isActive = currentPath === to;
  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className="w-full justify-start text-left"
      onClick={onClick}
    >
      <Link to={to}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
};

interface SidebarContentProps {
  onClose?: () => void;
}

const SidebarContent = ({ onClose }: SidebarContentProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
  };

  const navLinks = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/data-entry", icon: Zap, label: "Registrar Leitura" },
    { to: "/readings", icon: ListChecks, label: "Minhas Leituras" },
    { to: "/reports", icon: BarChart3, label: "Relatórios" },
    { to: "/settings", icon: SettingsIcon, label: "Configurações" },
    { to: "/profile", icon: User, label: "Perfil" },
    { to: "/about", icon: Info, label: "Sobre" }, // Adicionar link para a página Sobre
  ];

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-2">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Navegação</h2>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            currentPath={location.pathname}
            onClick={onClose}
          />
        ))}
      </div>
      <div className="mt-auto space-y-2 border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-left text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ isMobile, isOpen, onOpenChange }: SidebarProps) => {
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onClose={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar-background text-sidebar-foreground h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
};