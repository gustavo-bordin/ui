"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Shield,
} from "lucide-react"

import { Button } from "@/components/ui/button"

interface OpenFinanceConnectionStepProps {
  userId: string
  onComplete: () => void
  onSkip: () => void
}

export function OpenFinanceConnectionStep({
  userId,
  onComplete,
  onSkip,
}: OpenFinanceConnectionStepProps) {
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<
    "idle" | "connecting" | "success" | "error"
  >("idle")
  const [showContent, setShowContent] = React.useState(false)

  React.useEffect(() => {
    setShowContent(true)
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus("connecting")

    try {
      // Simulate OpenFinance connection process
      // In a real implementation, this would redirect to OpenFinance OAuth
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful connection
      setConnectionStatus("success")

      // Update user onboarding status
      await fetch("/api/onboarding/openfinance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          connected: true,
        }),
      })

      // Auto-proceed after success
      setTimeout(() => {
        onComplete()
      }, 1500)
    } catch (error) {
      console.error("Error connecting to OpenFinance:", error)
      setConnectionStatus("error")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRealConnect = () => {
    // In a real implementation, this would redirect to OpenFinance OAuth
    // For now, we'll simulate the connection
    handleConnect()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Bottom light effect */}
      <div className="absolute right-0 bottom-0 left-0 h-96 bg-gradient-to-t from-white/6 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/10 via-white/5 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-lg px-6">
        {/* Header */}
        <div
          className={`mb-12 text-center transition-all duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <h2 className="mb-6 text-2xl leading-tight font-light text-white">
            Conecte sua Conta Bancária
          </h2>
          <p className="text-base text-gray-300">
            Conecte-se com OpenFinance para sincronizar suas transações
            automaticamente
          </p>
        </div>

        {/* Benefits */}
        <div
          className={`mb-8 space-y-4 transition-all delay-300 duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-white/60" />
              <span className="text-sm text-gray-300">
                Sincronização automática
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-white/60" />
              <span className="text-sm text-gray-300">Segurança garantida</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-white/60" />
              <span className="text-sm text-gray-300">Múltiplas contas</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-white/60" />
              <span className="text-sm text-gray-300">Análise completa</span>
            </div>
          </div>
        </div>

        {/* Connection status */}
        {connectionStatus === "connecting" && (
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span className="text-sm text-gray-300">
                Conectando com OpenFinance... Isso pode levar alguns segundos.
              </span>
            </div>
          </div>
        )}

        {connectionStatus === "success" && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">
                Sucesso! Sua conta foi conectada com OpenFinance.
                Redirecionando...
              </span>
            </div>
          </div>
        )}

        {connectionStatus === "error" && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-300">
                Erro ao conectar com OpenFinance. Tente novamente ou pule esta
                etapa.
              </span>
            </div>
          </div>
        )}

        {/* Security info */}
        <div
          className={`mb-8 rounded-lg border border-white/10 bg-white/5 p-4 transition-all delay-500 duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-start space-x-3">
            <Shield className="mt-0.5 h-4 w-4 text-white/60" />
            <div>
              <h4 className="text-sm font-medium text-white">
                Suas informações estão seguras
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                Utilizamos a tecnologia OpenFinance, regulamentada pelo Banco
                Central do Brasil. Suas credenciais bancárias nunca são
                armazenadas em nossos servidores.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`flex items-center justify-between transition-all delay-700 duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Pular por agora
          </button>

          <Button
            onClick={handleRealConnect}
            disabled={isConnecting || connectionStatus === "success"}
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-2 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-2xl"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : connectionStatus === "success" ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Conectado!
              </>
            ) : (
              <>
                Conectar com OpenFinance
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Additional info */}
        <div
          className={`mt-6 text-center transition-all delay-1000 duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <p className="text-xs text-gray-500">
            Você pode conectar sua conta bancária a qualquer momento nas
            configurações.
          </p>
        </div>
      </div>
    </div>
  )
}
