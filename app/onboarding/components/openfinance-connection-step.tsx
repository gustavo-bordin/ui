"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

interface OpenFinanceConnectionStepProps {
  userId: string
  onComplete: () => void
  onSkip?: () => void
  onBack?: () => void
}

const AVAILABLE_BANKS = [
  { id: "ofnubank_br_retail", name: "Nubank", logo: "🟣" },
  { id: "ofsantander_br_retail", name: "Santander", logo: "🔴" },
  { id: "ofitau_br_retail", name: "Itaú", logo: "🟠" },
  { id: "ofbradesco_br_retail", name: "Bradesco", logo: "🔵" },
  { id: "ofbanco_do_brasil_br_retail", name: "Banco do Brasil", logo: "🟡" },
  { id: "ofcaixa_br_retail", name: "Caixa", logo: "🔵" },
  { id: "ofmercadopago_br_retail", name: "MercadoPago", logo: "💙" },
  { id: "ofpicpay_br_retail", name: "PicPay", logo: "🟢" },
  { id: "ofsicredi_br_retail", name: "Sicredi", logo: "🟠" },
  { id: "ofsicoob_br_retail", name: "Sicoob", logo: "🔵" },
  { id: "ofbanco_pan_br_retail", name: "Banco Pan", logo: "🟣" },
  {
    id: "ofbanco_do_nordeste_br_retail",
    name: "Banco do Nordeste",
    logo: "🟡",
  },
  { id: "ofbanco_bmg_br_retail", name: "Banco BMG", logo: "🟤" },
  { id: "outro", name: "Outro banco", logo: "❓" },
]

export function OpenFinanceConnectionStep({
  userId,
  onComplete,
  onSkip,
  onBack,
}: OpenFinanceConnectionStepProps) {
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [showContent, setShowContent] = React.useState(false)
  const [selectedBank, setSelectedBank] = React.useState<string | null>(null)
  const [showUnsupportedMessage, setShowUnsupportedMessage] =
    React.useState(false)

  React.useEffect(() => {
    setShowContent(true)
  }, [])

  const handleConnect = async (bankId: string) => {
    setIsConnecting(true)

    try {
      // Get user's CPF from the database first
      const cpfResponse = await fetch(`/api/onboarding/cpf?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!cpfResponse.ok) {
        throw new Error(
          "CPF não encontrado. Por favor, volte e informe seu CPF."
        )
      }

      const { cpf } = await cpfResponse.json()

      // Generate Belvo access token with user's CPF
      const tokenResponse = await fetch("/api/belvo/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          cpf,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Erro ao gerar token de acesso")
      }

      const tokenData = await tokenResponse.json()
      console.log("Access Token Response:", tokenData)
      const { access_token } = tokenData

      if (!access_token) {
        console.error("No access_token received:", tokenData)
        throw new Error("Token de acesso não foi gerado corretamente")
      }

      // Launch Belvo widget in the same window with selected institution
      const widgetUrl = `https://widget.belvo.io/?access_token=${access_token}&mode=webapp&locale=pt&institution=ofmockbank_br_retail`
      console.log("Widget URL:", widgetUrl)

      // Redirect to the Belvo widget in the same window
      window.location.href = widgetUrl
    } catch (error) {
      console.error("Error connecting to OpenFinance:", error)
      setIsConnecting(false)
    }
  }

  const handleBankSelect = (bankId: string) => {
    if (bankId === "outro") {
      setShowUnsupportedMessage(true)
      return
    }

    setSelectedBank(bankId)
    handleConnect(bankId)
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
            Qual é o seu banco principal?
          </h2>
          <p className="text-base text-gray-400">
            Selecione seu banco para conectar sua conta com Open Finance
          </p>
        </div>

        {/* Bank Selection Grid */}
        <div
          className={`mb-6 transition-all delay-300 duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="grid grid-cols-3 gap-2">
            {AVAILABLE_BANKS.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleBankSelect(bank.id)}
                disabled={isConnecting}
                className={`group relative overflow-hidden rounded-lg border border-white/5 bg-gradient-to-r from-white/5 to-white/[0.02] p-2.5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedBank === bank.id
                    ? "border-white/20 bg-white/[0.08]"
                    : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex flex-col items-center space-y-1">
                  <span className="text-xl">{bank.logo}</span>
                  <span className="text-center text-[10px] leading-tight font-medium text-white/90">
                    {bank.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Unsupported Bank Message */}
        {showUnsupportedMessage && (
          <div
            className={`mb-8 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 transition-all duration-500 ${
              showUnsupportedMessage
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-yellow-400">⚠️</span>
              <div>
                <h4 className="text-sm font-medium text-yellow-300">
                  Banco não suportado ainda
                </h4>
                <p className="mt-1 text-xs text-yellow-200/80">
                  Este banco ainda não está disponível para conexão via Open
                  Finance. Estamos trabalhando para adicionar mais bancos em
                  breve.
                </p>
                <button
                  onClick={() => setShowUnsupportedMessage(false)}
                  className="mt-2 text-xs text-yellow-300 underline hover:text-yellow-200"
                >
                  Voltar à seleção
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isConnecting && (
          <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span className="text-sm text-gray-300">
                Conectando com{" "}
                {AVAILABLE_BANKS.find((b) => b.id === selectedBank)?.name}...
              </span>
            </div>
          </div>
        )}

        {/* Back Button */}
        {onBack && (
          <div
            className={`text-left transition-all delay-500 duration-500 ${
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <button
              onClick={onBack}
              disabled={isConnecting}
              className="text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-50"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
