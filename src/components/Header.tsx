"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom"; // Importar useLocation
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext"; // Importar useAuth

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle: string;
}

export const Header = ({ onMenuClick, pageTitle }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { currentUser } = useAuth(); // Obter o usuário atual

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
        {/* Mensagem de boas-vindas */}
        {currentUser && (
          <span className="text-muted-foreground text-sm hidden md:block">
            Olá, {currentUser.email?.split('@')[0]}!
          </span>
        )}
        {/* Toggle de tema */}
        <ThemeToggle />
      </div>
    </header>
  );
};