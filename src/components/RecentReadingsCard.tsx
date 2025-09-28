"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserReadings } from "@/hooks/useUserReadings";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";

const RecentReadingsCard = () => {
  const { readings, loading, error } = useUserReadings();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Últimas Leituras</CardTitle>
          <CardDescription>Carregando leituras recentes...</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Últimas Leituras</CardTitle>
          <CardDescription>Erro ao carregar leituras recentes.</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  const latestFiveReadings = readings.slice(-5).reverse(); // Pega as 5 últimas e inverte para mostrar a mais recente primeiro

  return (
    <Card className="w-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Últimas Leituras</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate("/readings")}>
          <ListChecks className="mr-2 h-4 w-4" /> Ver Todas
        </Button>
      </CardHeader>
      <CardContent>
        {latestFiveReadings.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <p>Nenhuma leitura registrada ainda.</p>
            <Button onClick={() => navigate("/data-entry")} className="mt-4">
              Registrar a primeira leitura
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Leitura (kWh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestFiveReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell>{reading.timestamp.toLocaleDateString()} {reading.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell className="text-right">{reading.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentReadingsCard;