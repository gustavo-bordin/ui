import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const linkId = searchParams.get("link")
    const institution = searchParams.get("institution")

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`
      )
    }

    const { error: connectionError } = await supabase
      .from("bank_connections")
      .insert({
        user_id: user.id,
        link_id: linkId,
        institution: institution,
        status: "active",
        connected_at: new Date().toISOString(),
      })

    if (connectionError) {
      console.error("Error storing bank connection:", connectionError)
    }

    const { error: onboardingError } = await supabase
      .from("user_onboarding")
      .upsert(
        {
          user_id: user.id,
          has_completed_onboarding: true,
          openfinance_connected: true,
          belvo_link_id: linkId,
          connection_date: new Date().toISOString(),
          current_step: 5,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

    if (onboardingError) {
      console.error("Error updating user onboarding:", onboardingError)
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/belvo/success?link=${linkId}&institution=${institution}`
    )
  } catch (error) {
    console.error("Error in Belvo success callback:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/belvo/error?error_code=PROCESSING_ERROR&error_message=Erro interno do servidor`
    )
  }
}
