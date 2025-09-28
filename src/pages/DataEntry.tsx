"use client";

import React, { useState, useEffect } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { showSuccess, showError } from "@/utils/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUserReadings } from "@/hooks/useUserReadings";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; // Importar Textarea

const formSchema = z.object({
  reading: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "A leitura não pode ser negativa.").max(999999999, "A leitura é muito alta.").refine(
      (val) => !isNaN(val),
      "A leitura deve ser um número válido."
    )
  ),
  resetMeter: z.boolean().default(false).optional(),
  observations: z.string().optional(), // Novo campo para observações
});

const DataEntry = () => {
  const { currentUser, loading: loadingAuth } = useAuth();
  const { readings, loading: loadingReadings } = useUserReadings();
  const navigate = useNavigate();
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reading: 0,
      resetMeter: false,
      observations: "", // Valor padrão para observações
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "resetMeter" && value.resetMeter) {
        form.setValue("reading", 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
        observations: values.observations || "", // Salvar observações
      });
      showSuccess("Leitura registrada com sucesso!");
      form.reset({
        reading: 0,
        resetMeter: false,
        observations: "", // Resetar observações também
      });
    } catch (error: any) {
      showError(`Falha ao registrar leitura: ${error.message}`);
      console.error("Data entry error:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingAuth || loadingReadings) {
    return <LoadingSpinner message="Carregando dados do usuário..." />;
  }

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const latestReadingValue = latestReading ? latestReading.value.toFixed(2) : "0.00";

  return (
    <div className="flex items-center justify-center">
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
                        placeholder={`Última leitura: ${latestReadingValue} kWh`}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resetMeter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Marcar se houve troca de relógio (zera o contador)
                      </FormLabel>
                      <FormDescription>
                        Se o medidor foi trocado, a leitura atual deve começar de 0.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="observations">Observações (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        id="observations"
                        placeholder="Adicione quaisquer observações sobre esta leitura..."
                        {...field}
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