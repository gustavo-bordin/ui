"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { OpenFinanceConnectionStep } from "./openfinance-connection-step"
import { UserGoalsStep } from "./user-goals-step"
import { WelcomeStep } from "./welcome-step"

interface OnboardingWizardProps {
  userId: string
  onComplete: () => void
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Bem-vindo",
    description: "Vamos começar sua jornada financeira",
    component: WelcomeStep,
  },
  {
    id: 2,
    title: "Objetivos",
    description: "Conte-nos sobre seus objetivos",
    component: UserGoalsStep,
  },
  {
    id: 3,
    title: "Conectar Conta",
    description: "Conecte sua conta bancária",
    component: OpenFinanceConnectionStep,
  },
  {
    id: 4,
    title: "Concluído!",
    description: "Tudo pronto para começar",
    component: null,
  },
]

export function OnboardingWizard({
  userId,
  onComplete,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const router = useRouter()

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100

  const handleStepComplete = (stepId: number) => {
    setCompletedSteps((prev) => [...prev, stepId])

    if (stepId < ONBOARDING_STEPS.length) {
      setCurrentStep(stepId + 1)
    } else {
      // Mark onboarding as complete
      markOnboardingComplete()
      onComplete()
    }
  }

  const markOnboardingComplete = async () => {
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark onboarding complete")
      }
    } catch (error) {
      console.error("Error marking onboarding complete:", error)
    }
  }

  const handleSkip = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      markOnboardingComplete()
      onComplete()
    }
  }

  const currentStepData = ONBOARDING_STEPS.find(
    (step) => step.id === currentStep
  )
  const CurrentComponent = currentStepData?.component

  if (currentStep === 4) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Parabéns!</CardTitle>
            <CardDescription>
              Sua conta está configurada e pronta para uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground text-center text-sm">
              Agora você pode começar a acompanhar suas finanças e alcançar seus
              objetivos.
            </div>
            <Button onClick={onComplete} className="w-full" size="lg">
              Ir para o Dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Current step content */}
      {CurrentComponent && (
        <CurrentComponent
          userId={userId}
          onComplete={() => handleStepComplete(currentStep)}
          onSkip={handleSkip}
        />
      )}
    </div>
  )
}
