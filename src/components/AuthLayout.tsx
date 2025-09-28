"use client";

import React, { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 space-y-6">
      {children}
    </div>
  );
};