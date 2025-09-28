import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap, DollarSign, Gauge } from "lucide-react";
import { useUserReadings } from "@/hooks/useUserReadings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { currentUser, userSettings, loading: loadingAuth, loadingSettings } = useAuth();
  const navigate = useNavigate();
  const { readings, dailyConsumption, loading: loadingReadings, error } = useUserReadings();

  const loading = loadingAuth || loadingSettings || loadingReadings;

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const totalConsumption = dailyConsumption.reduce((sum, data) => sum + data.consumption, 0);
  const totalCost = dailyConsumption.reduce((sum, data) => sum + data.cost, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, {currentUser?.email}!</h2>
        <p className="text-lg text-muted-foreground">
          Visão geral do seu consumo de energia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Leitura</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestReading ? `${latestReading.value.toFixed(2)} kWh` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestReading ? `em ${latestReading.timestamp.toLocaleDateString()}` : "Nenhuma leitura registrada"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Total</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumption.toFixed(2)} kWh</div>
            <p className="text-xs text-muted-foreground">
              Desde a primeira leitura
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Com tarifa de {userSettings?.manualTariff ? userSettings.manualTariff.toFixed(3) : "N/A"} R$/kWh
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-auto mb-8">
        <Button onClick={() => navigate("/data-entry")} className="mr-4">
          Registrar Nova Leitura
        </Button>
      </div>
    </div>
  );
};

export default Index;