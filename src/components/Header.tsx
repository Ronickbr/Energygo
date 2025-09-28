"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "@/components/Logo"; // Importar o componente Logo

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle: string; // Nova prop para o título da página
}

export const Header = ({ onMenuClick, pageTitle }: HeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {isMobile && (
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
        )}
        <Link to="/" className="flex items-center space-x-2">
          <Logo className="h-8" /> {/* Usar a logo aqui */}
          <span className="font-bold text-xl ml-2">{pageTitle}</span> {/* Título dinâmico */}
        </Link>
      </div>
      <ThemeToggle />
    </header>
  );
};