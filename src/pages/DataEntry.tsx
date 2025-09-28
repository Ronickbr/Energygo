"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Importar useParams
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore"; // Importar doc, getDoc, updateDoc
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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  reading: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "A leitura não pode ser negativa.").max(999999999, "A leitura é muito alta.").refine(
      (val) => !isNaN(val),
      "A leitura deve ser um número válido."
    )
  ),
  resetMeter: z.boolean().default(false).optional(),
  observations: z.string().optional(),
});

const DataEntry = () => {
  const { currentUser, loading: loadingAuth } = useAuth();
  const { readings, loading: loadingReadings } = useUserReadings();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Obter o ID da leitura da URL
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar se estamos editando

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reading: 0,
      resetMeter: false,
      observations: "",
    },
  });

  // Efeito para carregar os dados da leitura se estivermos no modo de edição
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchReadingToEdit = async () => {
        if (!currentUser) return;
        try {
          const readingDocRef = doc(db, `users/${currentUser.uid}/readings`, id);
          const docSnap = await getDoc(readingDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            form.reset({
              reading: data.value,
              observations: data.observations || "",
              resetMeter: false, // O checkbox de reset não se aplica ao editar uma leitura existente
            });
          } else {
            showError("Leitura não encontrada.");
            navigate("/readings"); // Redirecionar se a leitura não for encontrada
          }
        } catch (err: any) {
          showError(`Falha ao carregar leitura para edição: ${err.message}`);
          console.error("Error fetching reading for edit:", err);
          navigate("/readings");
        }
      };
      fetchReadingToEdit();
    } else {
      setIsEditing(false);
      // Resetar o formulário para valores padrão ao mudar para o modo de registro
      form.reset({
        reading: 0,
        resetMeter: false,
        observations: "",
      });
    }
  }, [id, currentUser, form, navigate]); // Adicionar form e navigate às dependências

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
      showError("Você precisa estar logado para registrar/atualizar leituras.");
      navigate("/signin");
      return;
    }

    setLoadingSubmit(true);
    try {
      if (isEditing && id) {
        // Modo de edição: atualizar documento existente
        const readingDocRef = doc(db, `users/${currentUser.uid}/readings`, id);
        await updateDoc(readingDocRef, {
          value: values.reading,
          observations: values.observations || "",
          // O timestamp não é atualizado na edição
        });
        showSuccess("Leitura atualizada com sucesso!");
        navigate("/readings"); // Voltar para a lista após a atualização
      } else {
        // Modo de registro: adicionar novo documento
        await addDoc(collection(db, `users/${currentUser.uid}/readings`), {
          value: values.reading,
          timestamp: serverTimestamp(),
          userId: currentUser.uid,
          observations: values.observations || "",
        });
        showSuccess("Leitura registrada com sucesso!");
        form.reset({
          reading: 0,
          resetMeter: false,
          observations: "",
        });
      }
    } catch (error: any) {
      showError(`Falha ao ${isEditing ? "atualizar" : "registrar"} leitura: ${error.message}`);
      console.error("Data entry/edit error:", error);
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
          <CardTitle className="text-2xl">{isEditing ? "Editar Leitura de Energia" : "Registrar Leitura de Energia"}</CardTitle>
          <CardDescription>
            {isEditing ? "Ajuste os detalhes da leitura existente." : "Insira a leitura atual do seu medidor de energia."}
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
                        placeholder={isEditing ? "Valor da leitura" : `Última leitura: ${latestReadingValue} kWh`}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && ( // O checkbox de reset só aparece no modo de registro
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
              )}

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
                {loadingSubmit ? (isEditing ? "Atualizando..." : "Registrando...") : (isEditing ? "Atualizar Leitura" : "Registrar Leitura")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntry;