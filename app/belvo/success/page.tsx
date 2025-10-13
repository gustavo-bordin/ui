"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function BelvoSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = React.useState(true)

  React.useEffect(() => {
    // Process the success callback
    const processSuccess = async () => {
      try {
        // Get parameters from Belvo callback
        const linkId = searchParams.get("link")
        const institution = searchParams.get("institution")

        console.log("Belvo success callback:", { linkId, institution })

        // Brief animation delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        setIsProcessing(false)
      } catch (error) {
        console.error("Error processing Belvo success:", error)
        setIsProcessing(false)
      }
    }

    processSuccess()
  }, [searchParams])

  const handleContinue = () => {
    // Redirect to dashboard or next step in onboarding
    router.push("/dashboard")
  }

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
            <CardTitle>Processando conexão...</CardTitle>
            <CardDescription>
              Estamos processando sua conexão bancária. Isso pode levar alguns
              segundos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">
            Conexão realizada com sucesso!
          </CardTitle>
          <CardDescription>
            Sua conta bancária foi conectada com sucesso através do Open
            Finance. Estamos sincronizando seus dados em segundo plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleContinue} className="w-full" size="lg">
            Continuar para o Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
