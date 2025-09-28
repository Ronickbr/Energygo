"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Sobre o Energo</CardTitle>
          <CardDescription>
            Sua ferramenta para monitorar e gerenciar o consumo de energia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            O Energo é um aplicativo desenvolvido para ajudar você a acompanhar seu consumo de energia elétrica de forma simples e eficiente. Registre suas leituras do medidor, visualize gráficos de consumo diário e mensal, e estime seus custos com base em tarifas configuráveis.
          </p>
          <p>
            Nosso objetivo é fornecer uma visão clara do seu uso de energia, permitindo que você tome decisões mais informadas para economizar e otimizar seu consumo.
          </p>
          <Separator />
          <div className="text-sm">
            <h4 className="font-semibold text-foreground mb-2">Recursos Principais:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Registro fácil de leituras de energia.</li>
              <li>Visualização de consumo e custos em gráficos interativos.</li>
              <li>Configuração de tarifas manuais ou detecção de região por CEP.</li>
              <li>Dashboard com resumo rápido das suas métricas.</li>
              <li>Gerenciamento de leituras com opção de exclusão.</li>
            </ul>
          </div>
          <Separator />
          <p className="text-center text-xs">
            Desenvolvido com React, TypeScript, Tailwind CSS e Firebase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;