"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>("")
  const [password, setPassword] = React.useState<string>("")
  const [error, setError] = React.useState<string>("")
  const supabase = createClient()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Translate common error messages to Portuguese
        let errorMessage = error.message
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid credentials")
        ) {
          errorMessage = "Email ou senha incorretos"
        } else if (
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada"
        } else if (error.message.toLowerCase().includes("user not found")) {
          errorMessage = "Usuário não encontrado"
        }

        setError(errorMessage)
      } else {
        // Redirect will be handled by the auth callback
        window.location.href = "/dashboard"
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

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
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
            <div className="flex items-center justify-between">
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
              <a
                href="/auth/forgot-password"
                className="text-sm font-normal text-gray-600 transition-colors hover:text-black"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="password"
              placeholder="Sua senha"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-2xl border border-gray-300 bg-white px-6 text-black backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 focus:outline-none"
            />
          </div>
          <Button
            disabled={isLoading}
            className="bg-black/ mt-2 h-12 cursor-pointer rounded-2xl bg-black px-6 font-light text-white transition-all duration-300 ease-in-out hover:bg-black/90 disabled:cursor-not-allowed"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 300,
            }}
          >
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Entrar
          </Button>
        </div>
      </form>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
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
  )
}
