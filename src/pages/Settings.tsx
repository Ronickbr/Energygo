"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showSuccess, showError } from "@/utils/toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido. Use o formato XXXXX-XXX ou XXXXXXXX.").optional().or(z.literal("")),
  manualTariff: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "A tarifa não pode ser negativa.").refine(
      (val) => !isNaN(val),
      "A tarifa deve ser um número válido."
    )
  ),
});

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cep: "",
      manualTariff: 0,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          form.reset({
            cep: data.cep || "",
            manualTariff: data.manualTariff || 0,
          });
        }
      }
    };
    fetchSettings();
  }, [currentUser, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      showError("Você precisa estar logado para salvar configurações.");
      navigate("/signin");
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, {
        cep: values.cep,
        manualTariff: values.manualTariff,
      }, { merge: true }); // Usa merge para não sobrescrever outros dados do usuário
      showSuccess("Configurações salvas com sucesso!");
    } catch (error: any) {
      showError(`Falha ao salvar configurações: ${error.message}`);
      console.error("Settings save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Configurações de Energia</CardTitle>
          <CardDescription>
            Gerencie seu CEP e a tarifa de energia para cálculos precisos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="cep">CEP (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        id="cep"
                        type="text"
                        placeholder="Ex: 12345-678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-sm text-muted-foreground">
                <p>
                  Para obter a tarifa automaticamente, você precisaria integrar com uma API de concessionária de energia.
                  Como fallback, você pode inserir a tarifa manualmente abaixo.
                </p>
              </div>
              <Separator />
              <FormField
                control={form.control}
                name="manualTariff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="manualTariff">Tarifa Manual (R$/kWh)</FormLabel>
                    <FormControl>
                      <Input
                        id="manualTariff"
                        type="number"
                        step="0.001"
                        placeholder="Ex: 0.75"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Button variant="link" onClick={() => navigate("/")}>
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;