"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react"; // Importar LogOut
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext"; // Importar useAuth

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle: string;
}

export const Header = ({ onMenuClick, pageTitle }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { currentUser, logout } = useAuth(); // Obter currentUser e logout do AuthContext

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {isMobile && (
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
        )}
        {/* Título da página */}
        <h1 className="font-bold text-2xl">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser && ( // Renderizar o botão de logout apenas se o usuário estiver logado
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:text-destructive">
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Sair</span>
          </Button>
        )}
        {/* Toggle de tema */}
        <ThemeToggle />
      </div>
    </header>
  );
};