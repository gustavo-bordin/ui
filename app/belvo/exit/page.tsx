"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, RefreshCw, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function BelvoExitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    // Log the exit event for analytics/monitoring
    const exitReason = searchParams.get("reason") || "user_cancelled"
    console.log("Belvo exit callback:", { exitReason })
  }, [searchParams])

  const handleRetry = () => {
    // Redirect back to onboarding or Open Finance step
    router.push("/onboarding")
  }

  const handleGoBack = () => {
    // Go back to dashboard or previous step
    router.back()
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <XCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Conexão interrompida</CardTitle>
          <CardDescription>
            Você saiu do processo de conexão bancária antes de concluí-lo. Não
            se preocupe, você pode tentar novamente a qualquer momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar conectar novamente
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
              A conexão bancária é opcional e pode ser feita posteriormente nas
              configurações da sua conta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
