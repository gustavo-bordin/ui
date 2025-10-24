"use client"

import * as React from "react"
import Link from "next/link"
import { UserAuthForm } from "@/components/user-auth-form"
import { BarChart3, Shield, Zap } from "lucide-react"

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

export default function AuthenticationPage() {
  const [showContent, setShowContent] = React.useState(false)
  const [randomTestimonial, setRandomTestimonial] = React.useState(
    testimonials[0]
  )

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
    return () => clearTimeout(timer)
  }, [])

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
          <span className="font-light">Tem uma conta?</span>{" "}
          <Link
            href="/auth/login"
            className="font-semibold transition-colors hover:text-gray-300"
          >
            Entrar
          </Link>
        </div>
      </div>

      {/* Left side - Black with logo */}
      <div className="relative hidden w-1/2 overflow-hidden rounded-r-[3rem] bg-black lg:flex lg:flex-col lg:px-16 lg:py-16">
        {/* Bottom light effect */}
        <div className="absolute right-0 bottom-0 left-0 h-96 bg-gradient-to-t from-white/6 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/10 via-white/5 to-transparent blur-3xl" />

        {/* Decorative image on the right */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2">
          <img
            src="https://jsfyfqlmzqkaxjfkmpxw.supabase.co/storage/v1/object/public/assets/auth_line_decoration.svg"
            alt=""
            className="h-auto w-auto opacity-50"
          />
        </div>

        {/* Logo */}
        <div className="relative z-20">
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

      {/* Right side - White with form */}
      <div className="relative flex w-full flex-1 items-center justify-center bg-white p-8 lg:w-1/2 lg:px-16 lg:py-16">
        {/* Top right login link - Desktop only */}
        <div className="absolute top-16 right-16 hidden lg:block">
          <p className="text-sm font-light text-gray-600">
            Tem uma conta?{" "}
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
            {/* Auth Form - now includes header and terms */}
            <UserAuthForm showHeader={true} />
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
