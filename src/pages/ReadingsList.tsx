"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserReadings, Reading } from "@/hooks/useUserReadings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, CalendarIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale"; // Importar locale para português
import { cn } from "@/lib/utils";
import { DateRange as RDPDateRange } from "react-day-picker"; // Importar DateRange do react-day-picker

// Definir o tipo de DateRange que o componente Calendar espera para 'selected'
interface CalendarSelectedDateRange {
  from: Date;
  to?: Date;
}

const ReadingsList = () => {
  const { readings, loading, error, deleteReading } = useUserReadings();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);
  // Usar o novo tipo para o estado dateRange
  const [dateRange, setDateRange] = useState<CalendarSelectedDateRange | undefined>(undefined);

  const handleDeleteClick = (readingId: string) => {
    setReadingToDelete(readingId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (readingToDelete) {
      await deleteReading(readingToDelete);
      setReadingToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredReadings = readings.filter((reading) => {
    if (!dateRange?.from && !dateRange?.to) {
      return true;
    }
    const readingDate = new Date(reading.timestamp.setHours(0, 0, 0, 0)); // Normalize reading date to start of day
    
    if (dateRange.from && readingDate < new Date(dateRange.from.setHours(0, 0, 0, 0))) {
      return false;
    }
    if (dateRange.to && readingDate > new Date(dateRange.to.setHours(23, 59, 59, 999))) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Carregando leituras..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Minhas Leituras</h1>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Filtrar por data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(selectedRange: RDPDateRange | undefined) => {
                  // Garante que 'from' esteja presente se um intervalo for selecionado
                  if (selectedRange && selectedRange.from) {
                    setDateRange({
                      from: selectedRange.from,
                      to: selectedRange.to,
                    });
                  } else {
                    // Se selectedRange for undefined ou 'from' estiver faltando, limpa o intervalo
                    setDateRange(undefined);
                  }
                }}
                numberOfMonths={2}
                locale={ptBR} // Definir locale para português
              />
            </PopoverContent>
          </Popover>
          {dateRange?.from && (
            <Button variant="ghost" onClick={() => setDateRange(undefined)}>
              Limpar Filtro
            </Button>
          )}
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leituras Registradas</CardTitle>
          <CardDescription>Visualize e gerencie suas leituras de energia.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReadings.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma leitura encontrada para o período selecionado.</p>
              {!dateRange?.from && (
                <Button onClick={() => navigate("/data-entry")} className="mt-4">
                  Registrar a primeira leitura
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Leitura (kWh)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>{reading.timestamp.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })} {reading.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{reading.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(reading.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Deletar leitura</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente sua leitura de energia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReadingsList;