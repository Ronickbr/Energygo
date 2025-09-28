"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { showWarning, showError, showSuccess } from "@/utils/toast";

export interface Reading {
  id: string;
  value: number;
  timestamp: Date;
  observations?: string; // Adicionar campo de observações
}

export interface ConsumptionData {
  date: string;
  consumption: number;
  cost: number;
}

export interface LastIntervalSummary {
  consumption: number;
  cost: number;
  startDate: Date | null;
  endDate: Date | null;
}

export const useUserReadings = () => {
  const { currentUser, userSettings, loading: loadingAuth, loadingSettings } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loading = loadingAuth || loadingSettings || loadingReadings;

  const fetchReadings = useCallback(async () => {
    if (!currentUser) {
      setLoadingReadings(false);
      return;
    }

    setLoadingReadings(true);
    setError(null);

    try {
      const readingsCollectionRef = collection(db, `users/${currentUser.uid}/readings`);
      const q = query(readingsCollectionRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);

      const fetchedReadings: Reading[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          value: data.value,
          timestamp: data.timestamp.toDate(), // Convert Firebase Timestamp to Date
          observations: data.observations || "", // Incluir observações
        };
      });
      setReadings(fetchedReadings);
    } catch (err: any) {
      console.error("Error fetching readings:", err);
      showError("Falha ao carregar dados de consumo.");
      setError(err.message);
    } finally {
      setLoadingReadings(false);
    }
  }, [currentUser]);

  const deleteReading = useCallback(async (readingId: string) => {
    if (!currentUser) {
      showError("Você precisa estar logado para deletar leituras.");
      return;
    }
    try {
      const readingDocRef = doc(db, `users/${currentUser.uid}/readings`, readingId);
      await deleteDoc(readingDocRef);
      showSuccess("Leitura deletada com sucesso!");
      await fetchReadings(); // Refetch data after deletion
    } catch (err: any) {
      showError(`Falha ao deletar leitura: ${err.message}`);
      console.error("Error deleting reading:", err);
    }
  }, [currentUser, fetchReadings]);

  useEffect(() => {
    if (currentUser && !loadingAuth) {
      fetchReadings();
    }
  }, [currentUser, loadingAuth, fetchReadings]);

  const calculateConsumptionAndCost = (
    readings: Reading[],
    tariff: number,
    period: "daily" | "monthly"
  ): ConsumptionData[] => {
    if (readings.length < 2 || tariff === 0) {
      return [];
    }

    const dataMap = new Map<string, { consumption: number; cost: number }>();

    for (let i = 1; i < readings.length; i++) {
      const prevReading = readings[i - 1];
      const currentReading = readings[i];

      const consumption = currentReading.value - prevReading.value;

      if (consumption < 0) {
        continue;
      }

      const cost = consumption * tariff;

      let key: string;
      const date = currentReading.timestamp;

      if (period === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else { // monthly
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`; // YYYY-MM
      }

      const existingData = dataMap.get(key) || { consumption: 0, cost: 0 };
      dataMap.set(key, {
        consumption: existingData.consumption + consumption,
        cost: existingData.cost + cost,
      });
    }

    return Array.from(dataMap.entries())
      .map(([date, { consumption, cost }]) => ({
        date,
        consumption: parseFloat(consumption.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const tariff = userSettings?.manualTariff || 0;
  const dailyConsumption = calculateConsumptionAndCost(readings, tariff, "daily");
  const monthlyConsumption = calculateConsumptionAndCost(readings, tariff, "monthly");

  // Calculate consumption and cost for the last 30 days
  const calculateLast30DaysSummary = useCallback((allReadings: Reading[], currentTariff: number) => {
    if (allReadings.length < 2 || currentTariff === 0) {
      return { consumption: 0, cost: 0 };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const readingsInLast30Days = allReadings.filter(
      (reading) => reading.timestamp >= thirtyDaysAgo
    );

    // If there are not enough readings in the last 30 days, or only one, return 0
    if (readingsInLast30Days.length < 2) {
      return { consumption: 0, cost: 0 };
    }

    // To calculate consumption for the last 30 days, we need the reading *before* the 30-day mark
    // if it exists, to get the first interval correctly.
    let relevantReadings = [...readingsInLast30Days];
    const firstReadingIn30Days = readingsInLast30Days[0];
    const indexBefore30Days = allReadings.findIndex(r => r.id === firstReadingIn30Days.id) - 1;

    if (indexBefore30Days >= 0) {
      relevantReadings = [allReadings[indexBefore30Days], ...readingsInLast30Days];
    }

    const dailyDataFor30Days = calculateConsumptionAndCost(relevantReadings, currentTariff, "daily");

    const totalConsumption = dailyDataFor30Days.reduce((sum, data) => sum + data.consumption, 0);
    const totalCost = dailyDataFor30Days.reduce((sum, data) => sum + data.cost, 0);

    return {
      consumption: parseFloat(totalConsumption.toFixed(2)),
      cost: parseFloat(totalCost.toFixed(2)),
    };
  }, [calculateConsumptionAndCost]);

  const last30DaysSummary = calculateLast30DaysSummary(readings, tariff);

  // NEW: Calculate consumption and cost for the last interval
  const calculateLastIntervalSummary = useCallback((allReadings: Reading[], currentTariff: number): LastIntervalSummary => {
    if (allReadings.length < 2 || currentTariff === 0) {
      return { consumption: 0, cost: 0, startDate: null, endDate: null };
    }

    // Ensure readings are sorted by timestamp
    const sortedReadings = [...allReadings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const lastReading = sortedReadings[sortedReadings.length - 1];
    const secondLastReading = sortedReadings[sortedReadings.length - 2];

    const consumption = lastReading.value - secondLastReading.value;
    const cost = consumption * currentTariff;

    return {
      consumption: parseFloat(consumption.toFixed(2)),
      cost: parseFloat(cost.toFixed(2)),
      startDate: secondLastReading.timestamp,
      endDate: lastReading.timestamp,
    };
  }, []);

  const lastIntervalSummary = calculateLastIntervalSummary(readings, tariff);

  return {
    readings,
    userSettings, // Now from AuthContext
    dailyConsumption,
    monthlyConsumption,
    last30DaysSummary, // New summary for last 30 days
    lastIntervalSummary, // New summary for the last interval
    loading,
    error,
    refetchReadings: fetchReadings, // Renamed to be specific
    deleteReading,
  };
};