"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Shield, Zap } from "lucide-react"

import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const testimonials = [
  {
    quote:
      "Esta plataforma transformou completamente como eu gerencio minhas finanças. Simples, intuitiva e poderosa.",
    name: "Maria Clara",
    role: "Empresária, São Paulo",
    initials: "MC",
  },
  {
    quote:
      "Finalmente consigo visualizar todos os meus gastos em um só lugar. A integração bancária é impecável!",
    name: "João Pedro",
    role: "Desenvolvedor, Rio de Janeiro",
    initials: "JP",
  },
  {
    quote:
      "Economizei mais de R$5.000 em 3 meses apenas entendendo melhor para onde meu dinheiro ia. Recomendo!",
    name: "Ana Paula",
    role: "Médica, Belo Horizonte",
    initials: "AP",
  },
  {
    quote:
      "A segurança é top! Consigo conectar todas as minhas contas sem medo. Interface linda e fácil de usar.",
    name: "Carlos Eduardo",
    role: "Arquiteto, Curitiba",
    initials: "CE",
  },
  {
    quote:
      "Como freelancer, controlar minhas finanças era um caos. Essa plataforma mudou minha vida profissional.",
    name: "Juliana Santos",
    role: "Designer, Florianópolis",
    initials: "JS",
  },
  {
    quote:
      "Os insights automáticos me ajudaram a identificar gastos desnecessários que eu nem percebia. Incrível!",
    name: "Ricardo Alves",
    role: "Professor, Brasília",
    initials: "RA",
  },
  {
    quote:
      "Depois de usar várias ferramentas, essa é a única que realmente entende o mercado brasileiro. Perfeita!",
    name: "Fernanda Lima",
    role: "Contadora, Salvador",
    initials: "FL",
  },
  {
    quote:
      "A conexão com Open Finance funcionou de primeira. Estou impressionado com a qualidade da plataforma.",
    name: "Bruno Costa",
    role: "Engenheiro, Porto Alegre",
    initials: "BC",
  },
  {
    quote:
      "Consigo planejar melhor meus investimentos vendo todo o panorama financeiro. Valeu cada centavo!",
    name: "Patricia Mendes",
    role: "Investidora, Recife",
    initials: "PM",
  },
  {
    quote:
      "Minha esposa e eu finalmente conseguimos organizar as finanças da família. Interface muito intuitiva!",
    name: "Lucas Oliveira",
    role: "Empresário, Campinas",
    initials: "LO",
  },
]

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState<string>("")
  const [confirmPassword, setConfirmPassword] = React.useState<string>("")
  const [isPasswordFocused, setIsPasswordFocused] =
    React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>("")
  const [success, setSuccess] = React.useState<boolean>(false)
  const [showContent, setShowContent] = React.useState(false)
  const [randomTestimonial, setRandomTestimonial] = React.useState(
    testimonials[0]
  )
  const supabase = createClient()
  const router = useRouter()

  const passwordRules = {
    minLength: password.length >= 12,
    hasLettersNumbersSpecialChars:
      /[a-zA-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^a-zA-Z0-9]/.test(password),
  }

  React.useEffect(() => {
    // Force light mode
    document.documentElement.style.colorScheme = "light"
    document.body.style.colorScheme = "light"
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")

    // Pick random testimonial
    const randomIndex = Math.floor(Math.random() * testimonials.length)
    setRandomTestimonial(testimonials[randomIndex])

    // Animate content
    const timer = setTimeout(() => setShowContent(true), 300)

    // Check for hash fragment (from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get("access_token")
    const refreshToken = hashParams.get("refresh_token")

    if (accessToken && refreshToken) {
      // Set the session from the tokens in the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }

    return () => clearTimeout(timer)
  }, [supabase.auth])

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

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
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        // Translate common error messages to Portuguese
        let errorMessage = error.message
        if (
          error.message
            .toLowerCase()
            .includes("new password should be different")
        ) {
          errorMessage = "A nova senha deve ser diferente da senha anterior"
        } else if (
          error.message.toLowerCase().includes("invalid credentials")
        ) {
          errorMessage = "Credenciais inválidas"
        } else if (error.message.toLowerCase().includes("session missing")) {
          errorMessage = "Sessão expirada. Solicite um novo link de redefinição"
        }

        setError(errorMessage)
        console.error("Erro ao redefinir senha:", error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    } catch (error) {
      console.error("Erro:", error)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden lg:flex-row">
      {/* Mobile Header */}
      <div className="relative z-30 flex items-center justify-between bg-black px-6 py-4 lg:hidden">
        <img
          src="https://jsfyfqlmzqkaxjfkmpxw.supabase.co/storage/v1/object/public/assets/logo_fin_dark_mode.svg"
          alt="Logo"
          className="h-7 w-auto"
        />
        <div className="text-sm text-white">
          <span className="font-light">Lembrou sua senha?</span>{" "}
          <Link
            href="/auth/login"
            className="font-semibold transition-colors hover:text-gray-300"
          >
            Entrar
          </Link>
        </div>
      </div>

      {/* Left side - White with form */}
      <div className="relative flex w-full flex-1 items-center justify-center bg-white p-8 lg:order-1 lg:w-1/2 lg:px-16 lg:py-16">
        {/* Top left login link - Desktop only */}
        <div className="absolute top-16 left-16 hidden lg:block">
          <p className="text-sm font-light text-gray-600">
            Lembrou sua senha?{" "}
            <Link
              href="/auth/login"
              className="font-normal text-black underline underline-offset-4 transition-colors hover:text-gray-700"
            >
              Entrar
            </Link>
          </p>
        </div>

        <div className="w-full max-w-md">
          <div
            className={`transition-all duration-700 ${
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <h1
                className="mb-4 text-4xl font-light tracking-tight text-black"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Redefinir senha
              </h1>
              <p
                className="text-base font-light text-gray-600"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 300,
                }}
              >
                Digite sua nova senha
              </p>
            </div>

            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <p className="mb-2 font-semibold">
                  Senha redefinida com sucesso!
                </p>
                <p>Redirecionando para o login...</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
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
                    Nova Senha
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
                          {passwordRules.hasLettersNumbersSpecialChars
                            ? "✓"
                            : "○"}
                        </span>
                        <span>
                          Contém letras, números e caracteres especiais
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-normal text-gray-700"
                    style={{
                      fontFamily:
                        'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontWeight: 400,
                    }}
                  >
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    placeholder="Digite a senha novamente"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 rounded-2xl border border-gray-300 bg-white px-6 text-black backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 focus:outline-none"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  disabled={isLoading}
                  className="mt-2 h-12 w-full cursor-pointer rounded-2xl border border-black/10 bg-black px-6 font-light text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed"
                  style={{
                    fontFamily:
                      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 300,
                  }}
                >
                  {isLoading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  Redefinir senha
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Black with logo */}
      <div className="relative hidden w-1/2 overflow-hidden rounded-l-[3rem] bg-black lg:order-2 lg:flex lg:flex-col lg:px-16 lg:py-16">
        {/* Bottom light effect */}
        <div className="absolute right-0 bottom-0 left-0 h-96 bg-gradient-to-t from-white/6 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/10 via-white/5 to-transparent blur-3xl" />

        {/* Decorative image on the left */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          <img
            src="https://jsfyfqlmzqkaxjfkmpxw.supabase.co/storage/v1/object/public/assets/auth_line_decoration.svg"
            alt=""
            className="h-auto w-auto scale-x-[-1] opacity-50"
          />
        </div>

        {/* Logo */}
        <div className="relative z-20 flex justify-end">
          <img
            src="https://jsfyfqlmzqkaxjfkmpxw.supabase.co/storage/v1/object/public/assets/logo_fin_dark_mode.svg"
            alt="Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Features - Centered */}
        <div className="relative z-20 mx-auto my-auto space-y-10">
          <div className="flex items-start gap-2">
            <BarChart3 className="text-bold h-6 w-6 pt-2 text-white" />

            <div>
              <p
                className="text-lg leading-relaxed font-light text-gray-300"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Entenda e enriqueça seus dados financeiros
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Shield className="h-6 w-6 pt-2 text-white" />
            <div>
              <p
                className="text-lg leading-relaxed font-light text-gray-300"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Análises e recomendações financeiras inteligentes e customizadas
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Zap className="h-6 w-6 pt-2 text-white" />

            <div>
              <p
                className="text-lg leading-relaxed font-light text-gray-300"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                }}
              >
                Tire duvidas sobre seus dados financeiros com nossa IA
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof & Testimonial - Bottom aligned */}
        <div className="relative z-20 space-y-4">
          <div className="text-center">
            <p
              className="text-sm font-light tracking-wider text-gray-400 uppercase"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
              }}
            >
              Usado por <span className="font-medium text-white">2000+</span>{" "}
              pessoas
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p
              className="mb-4 text-base leading-relaxed font-light text-white"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
              }}
            >
              &ldquo;{randomTestimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <span className="text-sm font-medium text-white">
                  {randomTestimonial.initials}
                </span>
              </div>
              <div>
                <p className="text-sm font-normal text-white">
                  {randomTestimonial.name}
                </p>
                <p className="text-xs font-light text-gray-400">
                  {randomTestimonial.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Features and Testimonial */}
      <div className="space-y-8 bg-black px-6 py-12 lg:hidden">
        {/* Features */}
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <BarChart3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
            <p
              className="text-sm font-light text-gray-300"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
              }}
            >
              Entenda e enriqueça seus dados financeiros
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
            <p
              className="text-sm font-light text-gray-300"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
              }}
            >
              Análises e recomendações financeiras inteligentes e customizadas
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
            <p
              className="text-sm font-light text-gray-300"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
              }}
            >
              Tire duvidas sobre seus dados financeiros com nossa IA
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <p
            className="text-xs font-light tracking-wider text-gray-400 uppercase"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 300,
            }}
          >
            Usado por <span className="font-medium text-white">2000+</span>{" "}
            pessoas
          </p>
        </div>

        {/* Testimonial */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p
            className="mb-3 text-sm leading-relaxed font-light text-white"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 300,
            }}
          >
            &ldquo;{randomTestimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
              <span className="text-xs font-medium text-white">
                {randomTestimonial.initials}
              </span>
            </div>
            <div>
              <p className="text-sm font-normal text-white">
                {randomTestimonial.name}
              </p>
              <p className="text-xs font-light text-gray-400">
                {randomTestimonial.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
