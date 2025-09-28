"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ConsumptionData } from "@/hooks/useUserReadings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConsumptionChartProps {
  data: ConsumptionData[];
  title: string;
  dataKey: "consumption" | "cost";
  unit: string;
  color: string;
}

const ConsumptionChart = ({ data, title, dataKey, unit, color }: ConsumptionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível para exibir o gráfico.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" unit={unit} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              activeDot={{ r: 8 }}
              name={dataKey === "consumption" ? "Consumo" : "Custo"}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ConsumptionChart;