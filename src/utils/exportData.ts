"use client";

import { Reading } from "@/hooks/useUserReadings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { showSuccess, showError } from "@/utils/toast";

/**
 * Exporta uma lista de leituras para um arquivo CSV.
 * @param readings A lista de leituras a ser exportada.
 * @param filename O nome do arquivo CSV (sem a extensão .csv).
 */
export const exportReadingsToCsv = (readings: Reading[], filename: string = "leituras_energo") => {
  if (!readings || readings.length === 0) {
    showError("Não há dados para exportar.");
    return;
  }

  try {
    // Adicionar cabeçalhos CSV
    const headers = ["ID", "Data", "Leitura (kWh)", "Observacoes"];
    const csvRows = [headers.join(",")];

    // Adicionar dados das leituras
    readings.forEach(reading => {
      const formattedDate = format(reading.timestamp, "yyyy-MM-dd HH:mm:ss", { locale: ptBR });
      const row = [
        `"${reading.id}"`, // Envolver ID em aspas para evitar problemas com caracteres especiais
        `"${formattedDate}"`,
        reading.value.toFixed(2),
        `"${reading.observations ? reading.observations.replace(/"/g, '""') : ''}"`, // Escapar aspas duplas e envolver em aspas
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      // Navegadores que suportam o atributo download
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess("Leituras exportadas com sucesso!");
    } else {
      // Fallback para navegadores mais antigos
      window.open(`data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`);
      showSuccess("Leituras exportadas com sucesso (aberto em nova janela/aba).");
    }
  } catch (error) {
    console.error("Erro ao exportar leituras para CSV:", error);
    showError("Falha ao exportar leituras.");
  }
};