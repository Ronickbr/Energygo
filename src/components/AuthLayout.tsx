"use client";

import React, { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {children}
    </div>
  );
};