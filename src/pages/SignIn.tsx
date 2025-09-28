import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AuthCard } from "@/components/AuthCard"; // Importar AuthCard

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();
  const { loading: loadingAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      showError(`Falha no login: ${error.message}`);
      console.error("Login error:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingAuth) {
    return <LoadingSpinner message="Verificando sessão..." />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <AuthCard
        title="Entrar"
        description="Insira seu e-mail e senha para acessar sua conta."
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
            {loadingSubmit ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{" "}
          <Link to="/signup" className="underline">
            Cadastre-se
          </Link>
        </div>
      </AuthCard>
    </div>
  );
};

export default SignIn;