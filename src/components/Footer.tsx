"use client";

import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="p-4 text-center bg-background border-t mt-auto">
      <p className="text-sm text-muted-foreground">
        &copy; {currentYear} Energy Tracker. Todos os direitos reservados.
      </p>
      <a
        href="https://www.dyad.sh/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-1 block"
      >
        Feito com Dyad
      </a>
    </footer>
  );
};