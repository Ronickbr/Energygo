"use client";

import React, { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header"; // Importar o novo Header

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 flex flex-col ${isMobile ? "pt-16" : ""}`}>
        {!isMobile && <Header />} {/* Renderizar Header apenas em desktop */}
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};