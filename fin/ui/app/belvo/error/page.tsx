"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Mail, RefreshCw } from "lucide-react"

export default function BelvoErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = React.useState<{
    code?: string
    message?: string
    type?: string
  }>({})

  React.useEffect(() => {
    // Extract error information from Belvo callback
    const errorCode = searchParams.get("error_code")
    const errorMessage = searchParams.get("error_message")
    const errorType = searchParams.get("error_type")

    const errorInfo = {
      code: errorCode,
      message: errorMessage,
      type: errorType,
    }

    setErrorDetails(errorInfo)
    console.error("Belvo error callback:", errorInfo)
  }, [searchParams])

  const handleRetry = () => {
    // Redirect back to onboarding or Open Finance step
    router.push("/onboarding")
  }

  const handleGoBack = () => {
    // Go back to dashboard or previous step
    router.back()
  }

  const getErrorMessage = () => {
    if (errorDetails.code) {
      switch (errorDetails.code) {
        case "INSTITUTION_NOT_SUPPORTED":
          return "A instituição financeira selecionada não é suportada pelo Open Finance."
        case "INVALID_CREDENTIALS":
          return "As credenciais fornecidas são inválidas. Verifique seus dados e tente novamente."
        case "CONNECTION_TIMEOUT":
          return "A conexão com a instituição financeira expirou. Tente novamente."
        case "INSTITUTION_ERROR":
          return "Ocorreu um erro na instituição financeira. Tente novamente em alguns minutos."
        default:
          return (
            errorDetails.message ||
            "Ocorreu um erro durante a conexão com sua conta bancária."
          )
      }
    }
    return "Ocorreu um erro durante a conexão com sua conta bancária."
  }

  const getErrorTitle = () => {
    if (errorDetails.type === "INSTITUTION_ERROR") {
      return "Erro na instituição financeira"
    } else if (errorDetails.type === "CONNECTION_ERROR") {
      return "Erro de conexão"
    }
    return "Erro na conexão"
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">{getErrorTitle()}</CardTitle>
          <CardDescription>{getErrorMessage()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorDetails.code && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Código do erro:</strong> {errorDetails.code}
                {errorDetails.type && (
                  <>
                    <br />
                    <strong>Tipo:</strong> {errorDetails.type}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            <p>
              Se o problema persistir, entre em contato conosco através do email
              de suporte.
            </p>
            <Button variant="link" size="sm" className="mt-2">
              <Mail className="mr-2 h-3 w-3" />
              Contatar suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
