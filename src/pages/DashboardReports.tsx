"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserReadings } from "@/hooks/useUserReadings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConsumptionChart from "@/components/ConsumptionChart";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner"; // Importar LoadingSpinner
import { useAuth } from "@/context/AuthContext";

const DashboardReports = () => {
  const { userSettings } = useAuth();
  const { dailyConsumption, monthlyConsumption, loading, error } = useUserReadings();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner message="Carregando relatórios..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
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
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios de Consumo</h1>
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
              {userSettings?.manualTariff ? userSettings.manualTariff.toFixed(3) : "Não Definida"}
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