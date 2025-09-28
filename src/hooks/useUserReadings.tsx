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
}

export interface ConsumptionData {
  date: string;
  consumption: number;
  cost: number;
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
    period: "daily" | "weekly" | "monthly"
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
      } else if (period === "weekly") {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        key = monday.toISOString().split("T")[0];
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
  const weeklyConsumption = calculateConsumptionAndCost(readings, tariff, "weekly");
  const monthlyConsumption = calculateConsumptionAndCost(readings, tariff, "monthly");

  return {
    readings,
    userSettings, // Now from AuthContext
    dailyConsumption,
    weeklyConsumption,
    monthlyConsumption,
    loading,
    error,
    refetchReadings: fetchReadings, // Renamed to be specific
    deleteReading,
  };
};