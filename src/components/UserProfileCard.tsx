"use client";

import React from "react";
import { User } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UserProfileCardProps {
  user: User | null;
}

export const UserProfileCard = ({ user }: UserProfileCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informações do Usuário</CardTitle>
        <CardDescription>Detalhes da sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-muted cursor-not-allowed"
          />
        </div>
      </CardContent>
    </Card>
  );
};