"use client"

import * as React from "react"
import { CheckCircle, Loader2, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CpfCollectionStepProps {
  userId: string
  onComplete: () => void
  onBack: () => void
}

// CPF validation function
const validateCPF = (cpf: string): boolean => {
  // Remove all non-digits
  const cleanCpf = cpf.replace(/\D/g, "")

  // Check if has 11 digits
  if (cleanCpf.length !== 11) return false

  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false

  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false

  return true
}

// CPF formatting function
const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "")

  if (cleanValue.length <= 3) {
    return cleanValue
  } else if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`
  } else if (cleanValue.length <= 9) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`
  } else {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`
  }
}

export function CpfCollectionStep({
  userId,
  onComplete,
  onBack,
}: CpfCollectionStepProps) {
  const [cpf, setCpf] = React.useState("")
  const [isValid, setIsValid] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showContent, setShowContent] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    setShowContent(true)
  }, [])

  React.useEffect(() => {
    const cleanCpf = cpf.replace(/\D/g, "")
    setIsValid(validateCPF(cleanCpf))
    setError("")
  }, [cpf])

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Por favor, insira um CPF válido")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const cleanCpf = cpf.replace(/\D/g, "")

      const response = await fetch("/api/onboarding/cpf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          cpf: cleanCpf,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("CPF API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        throw new Error(
          errorData.error ||
            `Erro ao salvar CPF (${response.status}: ${response.statusText})`
        )
      }

      onComplete()
    } catch (error) {
      console.error("Error saving CPF:", error)
      setError(
        error instanceof Error ? error.message : "Erro interno do servidor"
      )
    } finally {
      setIsSubmitting(false)
    }
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
            Informe seu CPF
          </h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Precisamos do seu CPF para conectar com o Open Finance e acessar
            suas informações bancárias de forma segura.
          </p>
        </div>

        {/* CPF Input */}
        <div
          className={`mb-8 transition-all delay-300 duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
                className="h-14 rounded-2xl border border-white/20 bg-white/10 px-6 text-white backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-white/40 focus:bg-white/15 focus:ring-0"
              />
              {cpf && isValid && (
                <CheckCircle className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-green-400" />
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>

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
                Seus dados estão protegidos
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                Seu CPF é criptografado e usado apenas para autenticação no Open
                Finance. Seguimos todas as normas de segurança do Banco Central.
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
            onClick={onBack}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Voltar
          </button>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-2 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-2xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
