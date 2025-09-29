import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, cpf } = await request.json()

    if (!userId || !cpf) {
      return NextResponse.json(
        { error: "Missing userId or cpf" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Ensure the authenticated user matches the userId
    if (user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 }
      )
    }

    // Generate Belvo access token
    const belvoResponse = await fetch('https://sandbox.belvo.com/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: process.env.BELVO_SECRET_ID,
        password: process.env.BELVO_SECRET_PASSWORD,
        scopes: "read_institutions,write_links,read_consents,write_consents,write_consent_callback,delete_consents",
        stale_in: "300d",
        fetch_resources: ["ACCOUNTS", "TRANSACTIONS", "OWNERS", "BILLS", "INVESTMENTS", "INVESTMENT_TRANSACTIONS"],
        external_id: userId, // This will be used to identify the user in webhooks
        widget: {
          purpose: "Soluções financeiras personalizadas oferecidas por meio de recomendações sob medida, visando melhores ofertas de produtos financeiros e de crédito.",
          openfinance_feature: "consent_link_creation",
          callback_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success`,
            exit: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/exit`,
            event: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/error`
          },
          consent: {
            terms_and_conditions_url: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
            permissions: ["REGISTER", "ACCOUNTS", "CREDIT_CARDS", "CREDIT_OPERATIONS"],
            identification_info: [
              {
                type: "CPF",
                number: cpf,
                name: user.user_metadata?.full_name || "Usuario"
              }
            ]
          },
          branding: {
            company_name: "Sua Aplicação",
            overlay_background_color: "#000000",
            social_proof: true
          },
          theme: []
        }
      })
    })

    if (!belvoResponse.ok) {
      const errorData = await belvoResponse.json().catch(() => ({}))
      console.error("Belvo API Error:", errorData)
      return NextResponse.json(
        { error: "Failed to generate Belvo token", details: errorData },
        { status: 500 }
      )
    }

    const tokenData = await belvoResponse.json()

    return NextResponse.json({ 
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in 
    })

  } catch (error) {
    console.error("Error in Belvo token API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
