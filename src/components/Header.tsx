"use client";

import React, { ReactNode } from "react"; // Importar ReactNode
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile"; // Importar useIsMobile

interface HeaderProps {
  pageTitle: string;
  menuButton?: ReactNode; // Novo prop para o botão de menu
}

export const Header = ({ pageTitle, menuButton }: HeaderProps) => {
  const { currentUser, logout } = useAuth();
  const isMobile = useIsMobile(); // Usar useIsMobile para decidir se o menuButton deve ser renderizado

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {isMobile && menuButton} {/* Renderiza o menuButton se for mobile e fornecido */}
        <h1 className="font-bold text-2xl">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser && (
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:text-destructive">
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Sair</span>
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};