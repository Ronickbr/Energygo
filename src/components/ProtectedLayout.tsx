"use client";

import React, { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;