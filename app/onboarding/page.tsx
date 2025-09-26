"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"

import { OnboardingWizard } from "./components/onboarding-wizard"

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    // Wait for auth to load
    if (loading) {
      return
    }

    // If no user after loading, redirect to auth
    if (!user) {
      // Add a small delay to prevent rapid redirects
      const timeoutId = setTimeout(() => {
        router.push("/auth")
      }, 500)

      return () => clearTimeout(timeoutId)
    }

    // User is authenticated, stop checking
    setIsChecking(false)
  }, [user, loading, router])

  const handleOnboardingComplete = () => {
    router.push("/dashboard")
  }

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <h2 className="mb-2 text-2xl font-semibold">Carregando...</h2>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // If no user after loading, show redirect message
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold">Redirecionando...</h2>
          <p className="text-muted-foreground">
            Redirecionando para autenticação...
          </p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingWizard userId={user.id} onComplete={handleOnboardingComplete} />
  )
}
