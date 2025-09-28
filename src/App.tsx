import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import DataEntry from "./pages/DataEntry";
import Settings from "./pages/Settings";
import DashboardReports from "./pages/DashboardReports";
import ReadingsList from "./pages/ReadingsList";
import Profile from "./pages/Profile";
import About from "./pages/About";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import SignUp from "./pages/SignUp";
import ProtectedLayout from "./components/ProtectedLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/"
                element={
                  <ProtectedLayout>
                    <Index />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/data-entry"
                element={
                  <ProtectedLayout>
                    <DataEntry />
                  </ProtectedLayout>
                }
              />
              <Route // Nova rota para edição de leituras
                path="/data-entry/:id"
                element={
                  <ProtectedLayout>
                    <DataEntry />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedLayout>
                    <Settings />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedLayout>
                    <DashboardReports />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/readings"
                element={
                  <ProtectedLayout>
                    <ReadingsList />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedLayout>
                    <Profile />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <ProtectedLayout>
                    <About />
                  </ProtectedLayout>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;