"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LastIntervalConsumptionCardProps {
  consumption: number;
  startDate: Date | null;
  endDate: Date | null;
}

const LastIntervalConsumptionCard = ({ consumption, startDate, endDate }: LastIntervalConsumptionCardProps) => {
  const hasData = startDate && endDate;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Consumo Último Intervalo</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {hasData ? `${consumption.toFixed(2)} kWh` : "N/A"}
        </div>
        <p className="text-xs text-muted-foreground">
          {hasData ? `de ${format(startDate!, "dd/MM", { locale: ptBR })} a ${format(endDate!, "dd/MM", { locale: ptBR })}` : "Mínimo de 2 leituras necessárias"}
        </p>
      </CardContent>
    </Card>
  );
};

export default LastIntervalConsumptionCard;