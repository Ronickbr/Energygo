import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Importar setDoc
import { auth, db } from "@/lib/firebase";
import { showSuccess, showError, showWarning } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

interface UserSettings {
  cep?: string;
  manualTariff: number;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean; // Loading for auth state
  logout: () => Promise<void>;
  userSettings: UserSettings | null;
  loadingSettings: boolean;
  refetchUserSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Loading for auth state
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true); // Loading for user settings
  const navigate = useNavigate();

  const fetchUserSettings = useCallback(async (user: User) => {
    setLoadingSettings(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let settings: UserSettings = { manualTariff: 0 };
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        settings = {
          cep: data.cep || "",
          manualTariff: data.manualTariff || 0,
        };
      }
      setUserSettings(settings);
      if (settings.manualTariff === 0) {
        showWarning("Por favor, configure sua tarifa de energia nas configurações para ver os custos.");
      }
    } catch (err: any) {
      console.error("Error fetching user settings:", err);
      showError("Falha ao carregar configurações do usuário.");
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        await fetchUserSettings(user);
      } else {
        setUserSettings(null);
        setLoadingSettings(false);
      }
    });
    return unsubscribe;
  }, [fetchUserSettings]);

  const logout = async () => {
    try {
      await signOut(auth);
      showSuccess("Desconectado com sucesso!");
      navigate("/signin");
      setUserSettings(null); // Clear settings on logout
    } catch (error) {
      showError("Falha ao desconectar.");
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    loading,
    logout,
    userSettings,
    loadingSettings,
    refetchUserSettings: useCallback(async () => {
      if (currentUser) {
        await fetchUserSettings(currentUser);
      }
    }, [currentUser, fetchUserSettings]),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && !loadingSettings && children}
    </AuthContext.Provider>
  );
};