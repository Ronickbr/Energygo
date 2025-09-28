"use client";

import React, { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "@/components/Footer"; // Importar o novo Footer

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 flex flex-col ${isMobile ? "pt-16" : ""}`}>
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
        <Footer /> {/* Usar o novo componente Footer */}
      </main>
    </div>
  );
};