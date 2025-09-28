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
import LoadingSpinner from "@/components/LoadingSpinner";
import { UserProfileCard } from "@/components/UserProfileCard"; // Importar UserProfileCard

const Profile = () => {
  const { currentUser, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

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

    setLoadingSubmit(true);
    try {
      await updatePassword(currentUser, newPassword);
      showSuccess("Senha atualizada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showError(`Falha ao atualizar senha: ${error.message}`);
      console.error("Password update error:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingAuth) {
    return <LoadingSpinner message="Carregando dados do perfil..." />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Meu Perfil</CardTitle>
          <CardDescription>
            Visualize suas informações e gerencie sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserProfileCard user={currentUser} />

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
            <Button type="submit" className="w-full" disabled={loadingSubmit}>
              {loadingSubmit ? "Atualizando..." : "Atualizar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;