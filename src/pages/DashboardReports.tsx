"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserReadings } from "@/hooks/useUserReadings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConsumptionChart from "@/components/ConsumptionChart";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const DashboardReports = () => {
  const { dailyConsumption, monthlyConsumption, loading, error, settings } = useUserReadings();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const totalConsumption = dailyConsumption.reduce((sum, data) => sum + data.consumption, 0);
  const totalCost = dailyConsumption.reduce((sum, data) => sum + data.cost, 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios de Consumo</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar ao Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Consumo Total (kWh)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalConsumption.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custo Total (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tarifa Atual (R$/kWh)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {settings?.manualTariff ? settings.manualTariff.toFixed(3) : "Não Definida"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 gap-6">
        <ConsumptionChart
          data={dailyConsumption}
          title="Consumo Diário (kWh)"
          dataKey="consumption"
          unit=" kWh"
          color="hsl(var(--primary))"
        />
        <ConsumptionChart
          data={dailyConsumption}
          title="Custo Diário (R$)"
          dataKey="cost"
          unit=" R$"
          color="hsl(var(--destructive))"
        />
        <ConsumptionChart
          data={monthlyConsumption}
          title="Consumo Mensal (kWh)"
          dataKey="consumption"
          unit=" kWh"
          color="hsl(var(--primary))"
        />
        <ConsumptionChart
          data={monthlyConsumption}
          title="Custo Mensal (R$)"
          dataKey="cost"
          unit=" R$"
          color="hsl(var(--destructive))"
        />
      </div>
    </div>
  );
};

export default DashboardReports;