"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserReadings, Reading } from "@/hooks/useUserReadings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, CalendarIcon, ArrowUpDown } from "lucide-react";
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
import { format, startOfDay, endOfDay, isBefore, isAfter } from "date-fns"; // Importar funções do date-fns
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type SortColumn = "timestamp" | "value";
type SortDirection = "asc" | "desc";

const ReadingsList = () => {
  const { readings, loading, error, deleteReading } = useUserReadings();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedReadings = [...readings]
    .filter((reading) => {
      if (!dateRange?.from && !dateRange?.to) {
        return true;
      }
      
      const readingDate = reading.timestamp;

      if (dateRange.from && isBefore(readingDate, startOfDay(dateRange.from))) {
        return false;
      }
      if (dateRange.to && isAfter(readingDate, endOfDay(dateRange.to))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortColumn === "timestamp") {
        compareValue = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sortColumn === "value") {
        compareValue = a.value - b.value;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });

  if (loading) {
    return <LoadingSpinner message="Carregando leituras..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center"> {/* Removido h-full */}
        <h2 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col"> {/* Removido h-full */}
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
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
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
          {filteredAndSortedReadings.length === 0 ? (
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
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("timestamp")}
                        className="px-0 hover:bg-transparent"
                      >
                        Data
                        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortColumn === "timestamp" ? "opacity-100" : "opacity-40")} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("value")}
                        className="px-0 hover:bg-transparent"
                      >
                        Leitura (kWh)
                        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortColumn === "value" ? "opacity-100" : "opacity-40")} />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>{format(reading.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
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