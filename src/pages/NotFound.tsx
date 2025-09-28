import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthCard } from "@/components/AuthCard"; // Importar AuthCard
import { Button } from "@/components/ui/button"; // Importar Button

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <AuthCard
        title="404 - Página Não Encontrada"
        description="A página que você está procurando não existe."
      >
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Oops! Parece que você se perdeu.
          </p>
          <Button asChild>
            <a href="/">
              Voltar para a Página Inicial
            </a>
          </Button>
        </div>
      </AuthCard>
    </div>
  );
};

export default NotFound;