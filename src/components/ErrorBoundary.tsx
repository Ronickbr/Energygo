"use client";

import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erros
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback personalizada
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <Frown className="mx-auto h-12 w-12 text-destructive mb-4" />
              <CardTitle className="text-2xl">Ocorreu um erro!</CardTitle>
              <CardDescription>
                Algo inesperado aconteceu. Por favor, tente recarregar a página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={this.handleReload}>Recarregar Página</Button>
              {this.state.error && (
                <details className="text-sm text-muted-foreground p-2 border rounded-md bg-secondary text-left">
                  <summary className="cursor-pointer">Detalhes do Erro</summary>
                  <pre className="whitespace-pre-wrap break-words mt-2">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;