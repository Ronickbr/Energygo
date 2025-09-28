"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { updatePassword } from "firebase/auth";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showError("Você precisa estar logado para atualizar a senha.");
      navigate("/signin");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      showError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentUser, newPassword);
      showSuccess("Senha atualizada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showError(`Falha ao atualizar senha: ${error.message}`);
      console.error("Password update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Meu Perfil</CardTitle>
          <CardDescription>
            Visualize suas informações e gerencie sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email || ""}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <Separator />

            <h3 className="text-lg font-semibold">Atualizar Senha</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar Senha"}
              </Button>
            </form>
          </div>
          <div className="mt-4 text-center text-sm">
            <Button variant="link" onClick={() => navigate("/")}>
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;