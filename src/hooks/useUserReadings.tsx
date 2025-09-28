"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { showWarning, showError } from "@/utils/toast";

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

export interface UserSettings {
  cep?: string;
  manualTariff: number;
}

export const useUserReadings = () => {
  const { currentUser } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadingsAndSettings = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user settings
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userSettings: UserSettings = { manualTariff: 0 };
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        userSettings = {
          cep: data.cep || "",
          manualTariff: data.manualTariff || 0,
        };
      }
      setSettings(userSettings);

      if (userSettings.manualTariff === 0) {
        showWarning("Por favor, configure sua tarifa de energia nas configurações para ver os custos.");
      }

      // Fetch readings
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
      console.error("Error fetching data:", err);
      showError("Falha ao carregar dados de consumo.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchReadingsAndSettings();
  }, [fetchReadingsAndSettings]);

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
        // Handle cases where reading might have been reset or entered incorrectly
        // For simplicity, we'll skip negative consumption, but a real app might flag this
        continue;
      }

      const cost = consumption * tariff;

      let key: string;
      const date = currentReading.timestamp;

      if (period === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        // Simple week calculation: Monday of the week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
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

  const dailyConsumption = calculateConsumptionAndCost(readings, settings?.manualTariff || 0, "daily");
  const weeklyConsumption = calculateConsumptionAndCost(readings, settings?.manualTariff || 0, "weekly");
  const monthlyConsumption = calculateConsumptionAndCost(readings, settings?.manualTariff || 0, "monthly");

  return {
    readings,
    settings,
    dailyConsumption,
    weeklyConsumption,
    monthlyConsumption,
    loading,
    error,
    refetch: fetchReadingsAndSettings,
  };
};