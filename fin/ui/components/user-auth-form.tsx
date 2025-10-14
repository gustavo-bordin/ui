"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/fin/ui/components/ui/button"
import { Input } from "@/fin/ui/components/ui/input"
import { Label } from "@/fin/ui/components/ui/label"
import { Check, ChevronRight } from "lucide-react"

import { createClient } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"

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

interface UserAuthFormProps extends React.ComponentProps<"div"> {
  showHeader?: boolean
}

export function UserAuthForm({
  className,
  showHeader = false,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [name, setName] = React.useState<string>("")
  const [email, setEmail] = React.useState<string>("")
  const [password, setPassword] = React.useState<string>("")
  const [isPasswordFocused, setIsPasswordFocused] =
    React.useState<boolean>(false)
  const [error, setError] = React.useState<string>("")
  const [showGoalsQuestions, setShowGoalsQuestions] =
    React.useState<boolean>(false)
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [userId, setUserId] = React.useState<string>("")
  const [showContent, setShowContent] = React.useState(true)
  const supabase = createClient()

  React.useEffect(() => {
    if (showGoalsQuestions) {
      setShowContent(false)
      setTimeout(() => setShowContent(true), 50)
    }
  }, [showGoalsQuestions, currentQuestion])

  const passwordRules = {
    minLength: password.length >= 12,
    hasLettersNumbersSpecialChars:
      /[a-zA-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^a-zA-Z0-9]/.test(password),
  }

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
        setShowContent(true)
      }, 300)
    } else {
      handleSubmitGoals()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setShowContent(false)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1)
        setShowContent(true)
      }, 300)
    }
  }

  const canProceed = () => {
    const currentQuestionData = QUESTIONS[currentQuestion]
    return answers[currentQuestionData.id] !== undefined
  }

  const handleSubmitGoals = async () => {
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

      // Show success message
      alert(
        "Respostas salvas! Verifique seu email para confirmar a conta e continuar."
      )
    } catch (error) {
      console.error("Error saving answers:", error)
      setError("Erro ao salvar respostas. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate password length
    if (password.length < 12) {
      setError("A senha deve ter pelo menos 12 caracteres")
      setIsLoading(false)
      return
    }

    // Validate password has letters, numbers, and special characters
    if (!passwordRules.hasLettersNumbersSpecialChars) {
      setError("A senha deve conter letras, números e caracteres especiais")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Check if the error is about existing user
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("user already exists") ||
          error.message.toLowerCase().includes("email already")
        ) {
          setError("Uma conta com esse email já existe.")
        } else {
          setError(error.message)
        }
        console.error("Erro ao criar conta:", error.message)
      } else if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        // User already exists (Supabase returns empty identities array for existing users)
        setError("Uma conta com esse email já existe.")
      } else if (data.user) {
        // Success! Show goals questions
        setUserId(data.user.id)
        setShowGoalsQuestions(true)
      }
    } catch (error) {
      console.error("Erro:", error)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Erro ao entrar com Google:", error.message)
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // If showing goals questions, render different UI
  if (showGoalsQuestions) {
    const currentQuestionData = QUESTIONS[currentQuestion]

    return (
      <div className="w-full">
        {/* Header - matching auth page style */}
        <div className="mb-8 text-center">
          <h1
            className="mb-4 text-4xl font-light tracking-tight text-black"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400,
            }}
          >
            Conte-nos sobre você
          </h1>
          <p
            className="text-base font-light text-gray-600"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 300,
            }}
          >
            Responda {QUESTIONS.length} perguntas rápidas para personalizarmos
            sua experiência
          </p>
        </div>

        {/* Minimal progress */}
        <div className="mb-8 text-center">
          <div className="text-sm text-gray-500">
            Pergunta {currentQuestion + 1} de {QUESTIONS.length}
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
          <div className="mb-6 text-center">
            <h2 className="mb-3 text-xl leading-tight font-normal text-black">
              {currentQuestionData.title}
            </h2>
            {currentQuestionData.subtitle && (
              <p className="text-sm text-gray-600">
                {currentQuestionData.subtitle}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestionData.options.map((option) => {
              const isSelected = answers[currentQuestionData.id] === option.id

              return (
                <button
                  key={option.id}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() =>
                    handleAnswerSelect(currentQuestionData.id, option.id)
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-black">{option.title}</h4>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-black" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className={`text-sm transition-colors ${
              currentQuestion === 0
                ? "cursor-not-allowed text-gray-400"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Voltar
          </button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="rounded-2xl border border-black/10 bg-black px-6 py-2 text-white transition-all duration-300 hover:bg-gray-800"
          >
            {isLoading
              ? "Salvando..."
              : currentQuestion === QUESTIONS.length - 1
                ? "Finalizar"
                : "Continuar"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Terms - matching auth page */}
        <p className="mt-8 text-center text-sm font-light text-gray-500">
          Suas respostas nos ajudam a personalizar sua experiência e são
          mantidas em segurança.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header - only show if showHeader prop is true */}
      {showHeader && (
        <div className="mb-8 text-center">
          <h1
            className="mb-4 text-4xl font-light tracking-tight text-black"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400,
            }}
          >
            Criar uma conta
          </h1>
          <p
            className="text-base font-light text-gray-600"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 300,
            }}
          >
            Crie sua conta com email e senha
          </p>
        </div>
      )}

      <div className={cn("grid gap-6", className)} {...props}>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-sm font-normal text-gray-700"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Nome
              </Label>
              <Input
                id="name"
                placeholder="Como prefere ser chamado"
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-2xl border border-gray-300 bg-white px-6 text-black backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-normal text-gray-700"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Email
              </Label>
              <Input
                id="email"
                placeholder="seu@email.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-2xl border border-gray-300 bg-white px-6 text-black backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-normal text-gray-700"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Senha
              </Label>
              <Input
                id="password"
                placeholder="Mínimo 12 caracteres com letras, números e símbolos"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
                className="h-12 rounded-2xl border border-gray-300 bg-white px-6 text-black backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 focus:outline-none"
              />
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isPasswordFocused || password.length > 0
                    ? "max-h-20 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-1 text-xs">
                  <div
                    className={`flex items-center gap-2 ${passwordRules.minLength ? "text-green-600" : "text-gray-500"}`}
                  >
                    <span>{passwordRules.minLength ? "✓" : "○"}</span>
                    <span>Pelo menos 12 caracteres</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordRules.hasLettersNumbersSpecialChars ? "text-green-600" : "text-gray-500"}`}
                  >
                    <span>
                      {passwordRules.hasLettersNumbersSpecialChars ? "✓" : "○"}
                    </span>
                    <span>Contém letras, números e caracteres especiais</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              disabled={isLoading}
              className="mt-2 h-12 cursor-pointer rounded-2xl border border-black/10 bg-black px-6 font-light text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
              }}
            >
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Criar Conta
            </Button>
          </div>
        </form>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
            {error === "Uma conta com esse email já existe." && (
              <>
                {" "}
                <Link
                  href="/auth/login"
                  className="font-semibold underline underline-offset-2 hover:text-red-700"
                >
                  Fazer login
                </Link>
              </>
            )}
          </div>
        )}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 font-light text-gray-500">
              Ou continue com
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={signInWithGoogle}
          className="h-12 cursor-pointer rounded-2xl border border-gray-300 bg-white px-6 font-light text-black transition-all duration-300 ease-in-out hover:border-gray-400 hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed"
          style={{
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 300,
            borderWidth: "1px",
            borderColor: "rgb(209, 213, 219)",
          }}
        >
          {isLoading ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}{" "}
          Google
        </Button>
      </div>

      {/* Terms - only show if showHeader prop is true */}
      {showHeader && (
        <p className="mt-8 text-center text-sm font-light text-gray-500">
          Ao continuar, você concorda com nossos{" "}
          <Link
            href="/terms"
            className="text-gray-700 underline underline-offset-4 transition-colors hover:text-black"
          >
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link
            href="/privacy"
            className="text-gray-700 underline underline-offset-4 transition-colors hover:text-black"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      )}
    </div>
  )
}
