"use client";

import React from "react";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <img
      src="https://i.imgur.com/lJDltSa.png"
      alt="Energo Logo"
      className={`h-10 w-auto ${className}`}
    />
  );
};

export default Logo;