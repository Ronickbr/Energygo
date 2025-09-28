"use client";

import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <span className="font-bold text-xl">Energy Tracker</span>
      </Link>
    </header>
  );
};