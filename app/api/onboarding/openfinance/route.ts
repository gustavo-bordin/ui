import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, connected } = await request.json()

    if (!userId || typeof connected !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update user onboarding status
    const { data, error } = await supabase.from("user_onboarding").upsert({
      user_id: userId,
      openfinance_connected: connected,
      connection_date: connected ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating OpenFinance status:", error)
      return NextResponse.json(
        { error: "Failed to update OpenFinance status" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in OpenFinance API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
