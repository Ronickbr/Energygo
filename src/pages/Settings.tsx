"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { regionalTariffs, getRegionFromCep, TariffRegion } from "@/utils/tariffData"; // Importar dados de tarifa

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
  const [detectedRegion, setDetectedRegion] = useState<TariffRegion | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cep: "",
      manualTariff: 0,
    },
  });

  const fetchAndSetRegion = useCallback(async (cepValue: string) => {
    if (cepValue && cepValue.match(/^\d{5}-?\d{3}$/)) {
      const regionName = await getRegionFromCep(cepValue);
      if (regionName) {
        const regionData = regionalTariffs.find(r => r.name === regionName);
        setDetectedRegion(regionData || null);
        if (regionData) {
          const averageTariff = (regionData.minTariff + regionData.maxTariff) / 2;
          // Sugere a tarifa média, mas não sobrescreve se o usuário já tiver uma manual
          if (form.getValues("manualTariff") === 0) { // Apenas se a tarifa manual for 0 (default)
            form.setValue("manualTariff", parseFloat(averageTariff.toFixed(3)));
          }
        }
      } else {
        setDetectedRegion(null);
      }
    } else {
      setDetectedRegion(null);
    }
  }, [form]);

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
          if (data.cep) {
            fetchAndSetRegion(data.cep);
          }
        }
      }
    };
    fetchSettings();
  }, [currentUser, form, fetchAndSetRegion]);

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
      }, { merge: true });
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
                        onBlur={(e) => {
                          field.onBlur();
                          fetchAndSetRegion(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {detectedRegion && (
                <div className="mt-2 p-3 border rounded-md bg-muted text-muted-foreground">
                  <p className="font-semibold">Região Detectada: {detectedRegion.name}</p>
                  <p>Tarifa Mínima: R$ {detectedRegion.minTariff.toFixed(3)}/kWh</p>
                  <p>Tarifa Máxima: R$ {detectedRegion.maxTariff.toFixed(3)}/kWh</p>
                  <p className="text-sm mt-1">
                    A tarifa manual abaixo foi preenchida com a média regional. Você pode ajustá-la.
                  </p>
                </div>
              )}

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