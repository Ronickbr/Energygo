"use client";

import React, { ReactNode, useState } from "react";
import { Sidebar, SidebarContent } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/data-entry":
        return "Registrar Leitura";
      case "/readings":
        return "Minhas Leituras";
      case "/reports":
        return "Relatórios";
      case "/settings":
        return "Configurações";
      case "/profile":
        return "Perfil";
      case "/about":
        return "Sobre";
      default:
        return "Energo";
    }
  };

  const currentPageTitle = getPageTitle(location.pathname);

  // Define o botão de menu para mobile
  const mobileMenuButton = (
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="mr-2">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menu</span>
      </Button>
    </SheetTrigger>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      <main className="flex-1 flex flex-col">
        {isMobile ? (
          // Para mobile, o Sheet envolve o Header e o conteúdo da Sidebar
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <Header pageTitle={currentPageTitle} menuButton={mobileMenuButton} />
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent onClose={() => setIsSidebarOpen(false)} />
            </SheetContent>
            <div className="flex-1 p-4 md:p-8">
              {children}
            </div>
          </Sheet>
        ) : (
          // Para desktop, renderiza Header e children normalmente
          <>
            <Header pageTitle={currentPageTitle} />
            <div className="flex-1 p-4 md:p-8">
              {children}
            </div>
          </>
        )}
        <Footer />
      </main>
    </div>
  );
};