"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LastIntervalCostCardProps {
  cost: number;
  tariff: number;
  startDate: Date | null;
  endDate: Date | null;
}

const LastIntervalCostCard = ({ cost, tariff, startDate, endDate }: LastIntervalCostCardProps) => {
  const hasData = startDate && endDate;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Custo Último Intervalo</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {hasData ? `R$ ${cost.toFixed(2)}` : "N/A"}
        </div>
        <p className="text-xs text-muted-foreground">
          Com tarifa de {tariff ? tariff.toFixed(3) : "N/A"} R$/kWh
        </p>
      </CardContent>
    </Card>
  );
};

export default LastIntervalCostCard;