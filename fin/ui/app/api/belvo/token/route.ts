import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { cpf } = await request.json()

    const url = `${process.env.BELVO_BASE_URL}${process.env.BELVO_ACCESS_TOKEN_ENDPOINT}`
    const payload = {
      id: process.env.BELVO_SECRET_ID,
      password: process.env.BELVO_SECRET_PASSWORD,
      scopes:
        "read_institutions,write_links,read_consents,write_consents,write_consent_callback,delete_consents",
      stale_in: "300d",
      fetch_resources: ["ACCOUNTS", "TRANSACTIONS", "OWNERS"],
      widget: {
        purpose:
          "Soluções financeiras personalizadas oferecidas por meio de recomendações sob medida, visando melhores ofertas de produtos financeiros e de crédito.",
        openfinance_feature: "consent_link_creation",
        callback_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/api/belvo/callback/success`,
          exit: `${process.env.NEXT_PUBLIC_APP_URL}/api/belvo/callback/exit`,
          event: `${process.env.NEXT_PUBLIC_APP_URL}/api/belvo/callback/error`,
        },
        consent: {
          terms_and_conditions_url: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
          permissions: [
            "REGISTER",
            "ACCOUNTS",
            "CREDIT_CARDS",
            "CREDIT_OPERATIONS",
          ],
          identification_info: [
            {
              type: "CPF",
              number: process.env.BELVO_TEST_USER_CPF ?? cpf,
              name: process.env.BELVO_TEST_USER_NAME ?? "Ralph Bragg",
            },
          ],
        },
      },
    }

    const belvoResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${process.env.BELVO_SECRET_ID}:${process.env.BELVO_SECRET_PASSWORD}`).toString("base64")}`,
      },
      body: JSON.stringify(payload),
    })

    if (!belvoResponse.ok) {
      const errorData = await belvoResponse.json().catch(() => ({}))

      console.error("Belvo API Error:", {
        status: belvoResponse.status,
        statusText: belvoResponse.statusText,
        error: errorData,
      })

      return NextResponse.json(
        { error: "Error from Belvo token API", details: errorData },
        { status: belvoResponse.status }
      )
    }

    const tokenData = await belvoResponse.json()
    return NextResponse.json({
      access_token: tokenData.access,
      refresh_token: tokenData.refresh,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
