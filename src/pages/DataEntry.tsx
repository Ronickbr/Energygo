"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showSuccess, showError } from "@/utils/toast";
import LoadingSpinner from "@/components/LoadingSpinner"; // Importar LoadingSpinner

const formSchema = z.object({
  reading: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "A leitura não pode ser negativa.").max(999999999, "A leitura é muito alta.").refine(
      (val) => !isNaN(val),
      "A leitura deve ser um número válido."
    )
  ),
});

const DataEntry = () => {
  const { currentUser, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Renomeado para evitar conflito com loadingAuth

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reading: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      showError("Você precisa estar logado para registrar leituras.");
      navigate("/signin");
      return;
    }

    setLoadingSubmit(true);
    try {
      await addDoc(collection(db, `users/${currentUser.uid}/readings`), {
        value: values.reading,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
      });
      showSuccess("Leitura registrada com sucesso!");
      form.reset();
    } catch (error: any) {
      showError(`Falha ao registrar leitura: ${error.message}`);
      console.error("Data entry error:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingAuth) {
    return <LoadingSpinner message="Carregando dados do usuário..." />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registrar Leitura de Energia</CardTitle>
          <CardDescription>
            Insira a leitura atual do seu medidor de energia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="reading">Leitura do Medidor (kWh)</FormLabel>
                    <FormControl>
                      <Input
                        id="reading"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1234.56"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loadingSubmit}>
                {loadingSubmit ? "Registrando..." : "Registrar Leitura"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntry;