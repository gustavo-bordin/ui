"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { CpfCollectionStep } from "./cpf-collection-step"
import { OpenFinanceConnectionStep } from "./openfinance-connection-step"

interface OnboardingWizardProps {
  userId: string
  onComplete: () => void
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "CPF",
    description: "Informe seu CPF para Open Finance",
    component: CpfCollectionStep,
  },
  {
    id: 2,
    title: "Conectar Conta",
    description: "Conecte sua conta bancária com Open Finance",
    component: OpenFinanceConnectionStep,
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
      // Mark onboarding as complete and redirect to dashboard
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
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        throw new Error(
          `Failed to mark onboarding complete: ${errorData.error || response.statusText}`
        )
      }

      const result = await response.json()
      console.log("Onboarding marked complete successfully:", result)
    } catch (error) {
      console.error("Error marking onboarding complete:", error)
      // Don't throw the error to prevent blocking the user flow
      // The user can still proceed to dashboard even if this fails
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

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = ONBOARDING_STEPS.find(
    (step) => step.id === currentStep
  )
  const CurrentComponent = currentStepData?.component

  return (
    <div className="bg-background min-h-screen">
      {/* Current step content */}
      {CurrentComponent && (
        <CurrentComponent
          userId={userId}
          onComplete={() => handleStepComplete(currentStep)}
          onSkip={handleSkip}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
