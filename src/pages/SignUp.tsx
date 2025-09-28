import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AuthCard } from "@/components/AuthCard";
import { AuthLayout } from "@/components/AuthLayout";
import Logo from "@/components/Logo"; // Importar o componente Logo

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();
  const { loading: loadingAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showSuccess("Conta criada com sucesso! Faça login para continuar.");
      navigate("/signin");
    } catch (error: any) {
      showError(`Falha no registro: ${error.message}`);
      console.error("Sign up error:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingAuth) {
    return <LoadingSpinner message="Verificando sessão..." />;
  }

  return (
    <AuthLayout>
      <Logo className="h-16" /> {/* Adicionar a logo aqui */}
      <AuthCard
        title="Cadastre-se"
        description="Crie sua conta para começar a gerenciar seu consumo de energia."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loadingSubmit}>
            {loadingSubmit ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Já tem uma conta?{" "}
          <Link to="/signin" className="underline">
            Entrar
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignUp;