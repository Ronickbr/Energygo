"use client";

import React, { ReactNode, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useLocation } from "react-router-dom"; // Importar useLocation

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation(); // Obter a localização atual

  // Função para determinar o título da página com base na rota
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
        return "Energo"; // Título padrão se a rota não for reconhecida
    }
  };

  const currentPageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isMobile={isMobile} isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} pageTitle={currentPageTitle} /> {/* Passar o título dinâmico */}
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};