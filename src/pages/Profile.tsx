"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { updatePassword, deleteUser } from "firebase/auth"; // Importar deleteUser
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UserProfileCard } from "@/components/UserProfileCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Importar AlertDialog

const Profile = () => {
  const { currentUser, loading: loadingAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Estado para o AlertDialog de exclusão

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
      showError(`Falha ao atualizar senha: ${error.message}. Por favor, faça login novamente e tente.`);
      console.error("Password update error:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      showError("Você precisa estar logado para excluir a conta.");
      navigate("/signin");
      return;
    }

    setLoadingSubmit(true);
    try {
      await deleteUser(currentUser);
      showSuccess("Sua conta foi excluída com sucesso.");
      await logout(); // Desconecta o usuário após a exclusão
    } catch (error: any) {
      showError(`Falha ao excluir conta: ${error.message}. Por favor, faça login novamente e tente.`);
      console.error("Delete account error:", error);
    } finally {
      setLoadingSubmit(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loadingAuth) {
    return <LoadingSpinner message="Carregando dados do perfil..." />;
  }

  return (
    <div className="flex items-center justify-center">
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

          <Separator />

          <h3 className="text-lg font-semibold text-destructive">Excluir Conta</h3>
          <p className="text-sm text-muted-foreground">
            Esta ação é irreversível. Todos os seus dados de leitura e configurações serão permanentemente removidos.
          </p>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={loadingSubmit}>
                Excluir Minha Conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {loadingSubmit ? "Excluindo..." : "Confirmar Exclusão"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;