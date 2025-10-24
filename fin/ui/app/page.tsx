"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    // If there's a code parameter, redirect to auth callback
    const code = searchParams.get("code")
    if (code) {
      router.push(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to Acme Inc
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              A modern dashboard application built with Next.js, shadcn/ui, and
              Tailwind CSS.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Authentication</Link>
            </Button>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Access your main dashboard with analytics, charts, and data
                  tables.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  Sign in or create an account using our authentication system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
