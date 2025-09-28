"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserReadings, Reading } from "@/hooks/useUserReadings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
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

const ReadingsList = () => {
  const { readings, loading, error, deleteReading } = useUserReadings();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando leituras...</p>
      </div>
    );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Minhas Leituras</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leituras Registradas</CardTitle>
          <CardDescription>Visualize e gerencie suas leituras de energia.</CardDescription>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
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
                    <TableHead>Leitura (kWh)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>{reading.timestamp.toLocaleDateString()} {reading.timestamp.toLocaleTimeString()}</TableCell>
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