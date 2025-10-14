import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Wait a moment for the session to be fully established
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check if user has completed onboarding
      const { data: onboardingData } = await supabase
        .from("user_onboarding")
        .select("has_completed_onboarding")
        .eq("user_id", data.user.id)
        .maybeSingle()

      // If user hasn't completed onboarding or no record exists, redirect to onboarding
      // This ensures all new accounts (email confirmations, OAuth) go through onboarding
      if (!onboardingData || !onboardingData.has_completed_onboarding) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
