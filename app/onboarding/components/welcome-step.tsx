"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

interface WelcomeStepProps {
  userId: string
  onComplete: () => void
  onSkip: () => void
  onBack?: () => void
}

export function WelcomeStep({ userId, onComplete }: WelcomeStepProps) {
  const { user } = useAuth()
  const [showContent, setShowContent] = React.useState(false)
  const [showButton, setShowButton] = React.useState(false)

  React.useEffect(() => {
    // Animate welcome message
    const timer1 = setTimeout(() => setShowContent(true), 500)
    const timer2 = setTimeout(() => setShowButton(true), 1000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuário"

  const handleComplete = async () => {
    try {
      // Update current_step to 2 (step 1 completed, moving to step 2)
      await fetch("/api/onboarding/step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, step: 2 }),
      })
    } catch (error) {
      console.error("Error updating step:", error)
      // Continue anyway, don't block the user
    }
    onComplete()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Bottom light effect */}
      <div className="absolute right-0 bottom-0 left-0 h-96 bg-gradient-to-t from-white/6 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/10 via-white/5 to-transparent blur-3xl" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .shimmer-text {
            background: linear-gradient(90deg, #ffffff 0%, #f0f0f0 25%, #ffffff 50%, #e0e0e0 75%, #ffffff 100%);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmer 2s ease-in-out infinite;
          }
        `,
        }}
      />
      <div className="relative z-10 text-center">
        {/* Welcome message */}
        <h1
          className={`shimmer-text text-5xl font-light tracking-tight transition-all duration-1000 md:text-6xl ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
          style={{
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
          }}
        >
          Bem-vindo, {userName}
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-8 text-xl font-light text-gray-300 transition-all delay-300 duration-1000 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
          style={{
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 300,
          }}
        >
          Vamos transformar sua relação com o dinheiro
        </p>

        {/* CTA Button */}
        <div
          className={`mt-12 transition-all delay-300 duration-1000 ${
            showButton ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Button
            onClick={handleComplete}
            size="lg"
            className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-light text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-2xl"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 300,
            }}
          >
            Começar Jornada
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
