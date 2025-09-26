"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UserGoalsStepProps {
  userId: string
  onComplete: () => void
  onSkip: () => void
}

const QUESTIONS = [
  {
    id: "priority",
    title: "Qual sua maior prioridade financeira agora?",
    subtitle: "Escolha a opção que mais se aplica à sua situação atual",
    options: [
      {
        id: "pay_debts",
        title: "Pagar dívidas",
        description: "Focar na redução de dívidas e juros",
      },
      {
        id: "emergency_fund",
        title: "Guardar uma reserva de emergência",
        description: "Construir uma reserva para imprevistos",
      },
      {
        id: "daily_expenses",
        title: "Controlar gastos do dia-a-dia",
        description: "Melhorar o controle dos gastos mensais",
      },
    ],
  },
  {
    id: "tracking",
    title: "Você costuma acompanhar seus gastos mensalmente?",
    subtitle: "Nos ajude a entender seus hábitos atuais",
    options: [
      {
        id: "regular_tracking",
        title: "Sim, eu já faço isso regularmente",
        description: "Tenho disciplina com o controle financeiro",
      },
      {
        id: "sometimes_tracking",
        title: "Às vezes, mas não com disciplina",
        description: "Faço esporadicamente, sem consistência",
      },
      {
        id: "never_tracking",
        title: "Não, quase nunca",
        description: "Não tenho o hábito de acompanhar gastos",
      },
    ],
  },
  {
    id: "spending_pattern",
    title:
      "Como você gasta mais: despesas fixas ou gastos inesperados / supérfluos?",
    options: [
      {
        id: "high_fixed_costs",
        title: "Tenho muitos custos fixos altos",
        description: "Aluguel, financiamentos e contas consomem muito",
      },
      {
        id: "impulse_spending",
        title: "Gasto demais com supérfluos",
        description: "Compras por impulso e gastos não planejados",
      },
      {
        id: "both_equal",
        title: "Os dois igualmente",
        description: "Custos fixos e gastos extras têm peso similar",
      },
    ],
  },
]

export function UserGoalsStep({
  userId,
  onComplete,
  onSkip,
}: UserGoalsStepProps) {
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [showContent, setShowContent] = React.useState(false)

  React.useEffect(() => {
    setShowContent(true)
  }, [currentQuestion])

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setShowContent(false)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setShowContent(false)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1)
      }, 300)
    }
  }

  const canProceed = () => {
    const currentQuestionData = QUESTIONS[currentQuestion]
    return answers[currentQuestionData.id] !== undefined
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/onboarding/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          answers,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save answers")
      }

      onComplete()
    } catch (error) {
      console.error("Error saving answers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentQuestionData = QUESTIONS[currentQuestion]

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Bottom light effect */}
      <div className="absolute right-0 bottom-0 left-0 h-96 bg-gradient-to-t from-white/6 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/10 via-white/5 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-lg px-6">
        {/* Minimal progress */}
        <div className="mb-16 text-center">
          <div className="text-sm text-gray-400">
            {currentQuestion + 1} / {QUESTIONS.length}
          </div>
        </div>

        {/* Question content */}
        <div
          className={`transition-all duration-500 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-2xl leading-tight font-light text-white">
              {currentQuestionData.title}
            </h2>
            <p className="text-base text-gray-300">
              {currentQuestionData.subtitle}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestionData.options.map((option) => {
              const isSelected = answers[currentQuestionData.id] === option.id

              return (
                <button
                  key={option.id}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    isSelected
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  onClick={() =>
                    handleAnswerSelect(currentQuestionData.id, option.id)
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{option.title}</h4>
                      <p className="text-sm text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-16 flex items-center justify-between">
          <button
            onClick={currentQuestion === 0 ? onSkip : handleBack}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            {currentQuestion === 0 ? "Pular" : "Voltar"}
          </button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-2 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-2xl"
          >
            {isLoading
              ? "Salvando..."
              : currentQuestion === QUESTIONS.length - 1
                ? "Finalizar"
                : "Continuar"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
