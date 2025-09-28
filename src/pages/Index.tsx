import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

const Index = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate(); // Inicializar useNavigate

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ThemeToggle />
        <Button onClick={logout} variant="outline">
          Sair
        </Button>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao seu Dashboard, {currentUser?.email}!</h1>
        <p className="text-xl text-muted-foreground">
          Aqui você gerenciará seu consumo de energia.
        </p>
        <p className="mt-4 text-lg">
          Próximos passos: Adicionar formulário de leitura, relatórios e configurações.
        </p>
        <div className="mt-8">
          <Button onClick={() => navigate("/data-entry")} className="mr-4">
            Registrar Nova Leitura
          </Button>
          {/* Futuros botões para relatórios, configurações, etc. */}
        </div>
      </div>
      <div className="mt-auto">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;