import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap, DollarSign, Gauge, ListChecks } from "lucide-react"; // Importar ListChecks para o novo card
import { useUserReadings } from "@/hooks/useUserReadings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import RecentReadingsCard from "@/components/RecentReadingsCard";
import LastIntervalConsumptionCard from "@/components/LastIntervalConsumptionCard";
import LastIntervalCostCard from "@/components/LastIntervalCostCard";

const Index = () => {
  const { currentUser, userSettings } = useAuth();
  const navigate = useNavigate();
  const { readings, dailyConsumption, last30DaysSummary, lastIntervalSummary, loading, error } = useUserReadings();

  if (loading) {
    return <LoadingSpinner message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const totalConsumptionSinceFirstReading = dailyConsumption.reduce((sum, data) => sum + data.consumption, 0);
  const totalCostSinceFirstReading = dailyConsumption.reduce((sum, data) => sum + data.cost, 0);

  return (
    <div className="flex flex-col">
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
            <CardTitle className="text-sm font-medium">Consumo Últimos 30 Dias</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last30DaysSummary.consumption.toFixed(2)} kWh</div>
            <p className="text-xs text-muted-foreground">
              Com base nas leituras registradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Últimos 30 Dias</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {last30DaysSummary.cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Com tarifa de {userSettings?.manualTariff ? userSettings.manualTariff.toFixed(3) : "N/A"} R$/kWh
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Total (Desde Início)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumptionSinceFirstReading.toFixed(2)} kWh</div>
            <p className="text-xs text-muted-foreground">
              Desde a primeira leitura
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total (Desde Início)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCostSinceFirstReading.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Com tarifa de {userSettings?.manualTariff ? userSettings.manualTariff.toFixed(3) : "N/A"} R$/kWh
            </p>
          </CardContent>
        </Card>

        {/* New card for Total Readings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leituras</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readings.length}</div>
            <p className="text-xs text-muted-foreground">
              Leituras registradas no total
            </p>
          </CardContent>
        </Card>

        {/* Existing cards for Last Interval Summary */}
        <LastIntervalConsumptionCard
          consumption={lastIntervalSummary.consumption}
          startDate={lastIntervalSummary.startDate}
          endDate={lastIntervalSummary.endDate}
        />
        <LastIntervalCostCard
          cost={lastIntervalSummary.cost}
          tariff={userSettings?.manualTariff || 0}
          startDate={lastIntervalSummary.startDate}
          endDate={lastIntervalSummary.endDate}
        />
        <RecentReadingsCard />
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